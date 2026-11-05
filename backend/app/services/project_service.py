from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import cast, String

from app.models.project import Project
from app.models.technology import ProjectTechnology
from app.models.media import ProjectMedia
from app.schemas.project import ProjectCreate, ProjectUpdate
from typing import List, Optional


async def create_project(db: AsyncSession, project_in: ProjectCreate) -> Project:
    data_dict = project_in.model_dump(exclude={"tools", "media_urls"})

    db_project = Project(**data_dict)
    db.add(db_project)
    await db.flush()

    if project_in.tools:
        for tech in project_in.tools:
            db_tech = ProjectTechnology(project_id=str(db_project.id), tech_name=tech)
            db.add(db_tech)

    if project_in.media_urls:
        for url in project_in.media_urls:
            db_media = ProjectMedia(project_id=str(db_project.id), url=url)
            db.add(db_media)

    await db.commit()
    return await get_project_by_id(db, str(db_project.id))


async def get_projects(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    visibility: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    category: Optional[str] = None,
    tool: Optional[str] = None,
) -> List[Project]:
    stmt = select(Project).options(
        selectinload(Project.technologies),
        selectinload(Project.media),
        selectinload(Project.plans),
        selectinload(Project.logs),
    )

    if visibility:
        stmt = stmt.where(Project.visibility == visibility)

    if is_favorite is not None:
        stmt = stmt.where(Project.is_favorite == is_favorite)

    # [PERBAIKAN FILTER CATEGORY DI SINI]
    if category:
        # Cast kolom JSON ke String agar bisa menggunakan operator teks (ilike/like)
        stmt = stmt.where(cast(Project.category, String).ilike(f"%{category}%"))

    if tool:
        stmt = stmt.join(Project.technologies).where(
            ProjectTechnology.tech_name == tool
        )

    stmt = stmt.order_by(Project.is_favorite.desc(), Project.created_at.desc())
    stmt = stmt.offset(skip).limit(limit)

    result = await db.execute(stmt)
    projects = result.scalars().unique().all()

    for p in projects:
        p.tools = [t.tech_name for t in p.technologies]
        p.media_urls = [m.url for m in p.media]

    return list(projects)


async def get_public_projects(
    db: AsyncSession, skip: int = 0, limit: int = 10, category: Optional[str] = None
) -> List[Project]:
    return await get_projects(
        db, skip=skip, limit=limit, visibility="Public", category=category
    )


async def get_by_slug(db: AsyncSession, slug: str) -> Project | None:
    stmt = (
        select(Project)
        .where(Project.slug == slug)
        .options(
            selectinload(Project.plans),
            selectinload(Project.logs),
            selectinload(Project.media),
            selectinload(Project.technologies),
        )
    )
    result = await db.execute(stmt)
    project = result.scalars().first()

    if project:
        project.tools = [t.tech_name for t in project.technologies]
        project.media_urls = [m.url for m in project.media]

    return project


async def get_project_by_id(db: AsyncSession, project_id: str) -> Optional[Project]:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.technologies), selectinload(Project.media))
        .where(Project.id == project_id)
    )
    project = result.scalars().first()
    if project:
        project.tools = [t.tech_name for t in project.technologies]
        project.media_urls = [m.url for m in project.media]
    return project


async def update_project(
    db: AsyncSession, project_id: str, project_in: ProjectUpdate
) -> Optional[Project]:
    db_project = await get_project_by_id(db, project_id)
    if db_project:
        update_data = project_in.model_dump(
            exclude_unset=True, exclude={"tools", "media_urls"}
        )

        # Update kolom utama project
        for key, value in update_data.items():
            setattr(db_project, key, value)

        # Update tools jika disertakan dalam request
        if project_in.tools is not None:
            for tech in db_project.technologies:
                await db.delete(tech)
            for tech in project_in.tools:
                db_tech = ProjectTechnology(
                    project_id=str(db_project.id), tech_name=tech
                )
                db.add(db_tech)

        # Update media_urls jika disertakan dalam request
        if project_in.media_urls is not None:
            for media in db_project.media:
                await db.delete(media)
            for url in project_in.media_urls:
                db_media = ProjectMedia(project_id=str(db_project.id), url=url)
                db.add(db_media)

        await db.commit()
        return await get_project_by_id(db, project_id)

    return None


async def delete_project(db: AsyncSession, project_id: str) -> bool:
    db_project = await get_project_by_id(db, project_id)
    if db_project:
        await db.delete(db_project)
        await db.commit()
        return True
    return False

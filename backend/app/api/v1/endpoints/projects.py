from typing import List, Union, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    PublicProjectResponse,
    DevProjectResponse,
)
from app.services import project_service
from app.models.technology import ProjectTechnology
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user, get_optional_user

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.get("/filters/options", summary="Get dynamic filter options")
async def get_filter_options(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    # Filter opsi berdasarkan project milik user (jika login) atau project Public
    project_filter = (
        Project.user_id == current_user.id
        if current_user
        else Project.visibility == "Public"
    )

    tools_res = await db.execute(
        select(ProjectTechnology.tech_name)
        .join(Project, ProjectTechnology.project_id == Project.id)
        .where(project_filter)
        .distinct()
    )
    tools = [t for t in tools_res.scalars().all() if t]

    projects_res = await db.execute(
        select(Project.category, Project.role).where(project_filter)
    )
    categories = set()
    roles = set()

    for cat_list, role in projects_res.all():
        if cat_list:
            for c in cat_list:
                categories.add(c)
        if role:
            roles.add(role)

    return {
        "categories": sorted(list(categories)),
        "tools": sorted(list(tools)),
        "roles": sorted(list(roles)),
    }


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_project = await project_service.get_by_slug(
        db, slug=project_in.slug, user_id=current_user.id
    )
    if existing_project:
        raise HTTPException(
            status_code=400, detail="Project with this slug already exists in your account."
        )

    return await project_service.create_project(db, project_in, user_id=current_user.id)


@router.get(
    "/",
    response_model=List[Union[PublicProjectResponse, DevProjectResponse]],
    summary="Get Projects List (Per-User & Public Portfolio)",
)
@limiter.limit("60/minute")
async def get_projects_list(
    request: Request,
    mode: str = Query("portfolio", description="portfolio atau devdocs"),
    category: Optional[str] = None,
    tool: Optional[str] = None,
    visibility: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if current_user:
        # User yang login melihat daftar project miliknya sendiri
        effective_mode = mode
        effective_visibility = visibility
        target_user_id = current_user.id
    else:
        # Pengunjung anonim hanya melihat project Public dalam mode portfolio
        effective_mode = "portfolio"
        effective_visibility = "Public"
        target_user_id = None

    projects = await project_service.get_projects(
        db,
        user_id=target_user_id,
        skip=skip,
        limit=limit,
        visibility=effective_visibility,
        is_favorite=is_favorite,
        category=category,
        tool=tool,
    )

    if effective_mode == "portfolio":
        return [PublicProjectResponse.model_validate(p) for p in projects]
    return [DevProjectResponse.model_validate(p) for p in projects]


@router.get("/id/{project_id}", response_model=ProjectResponse)
async def read_project_by_id(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    project = await project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_owner = current_user is not None and project.user_id == current_user.id
    if not is_owner and project.visibility == "Private":
        raise HTTPException(status_code=403, detail="Access denied")

    return project


@router.get(
    "/{slug}",
    response_model=Union[PublicProjectResponse, DevProjectResponse],
    summary="Get Project Detail by Slug",
)
@limiter.limit("60/minute")
async def get_project_by_slug(
    request: Request,
    slug: str,
    mode: str = Query("portfolio"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    project = await project_service.get_by_slug(
        db, slug, user_id=current_user.id if current_user else None
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_owner = current_user is not None and project.user_id == current_user.id

    if not is_owner:
        if project.visibility == "Private":
            raise HTTPException(status_code=403, detail="Access denied")
        return PublicProjectResponse.model_validate(project)

    if mode == "portfolio":
        return PublicProjectResponse.model_validate(project)

    return DevProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def edit_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_project = await project_service.update_project(
        db, project_id, project_in, user_id=current_user.id
    )
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = await project_service.delete_project(
        db, project_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    return None
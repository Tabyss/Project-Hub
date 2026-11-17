import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone
from typing import List, Optional

from app.models.log import ProjectLog
from app.models.project import Project
from app.schemas.log import LogCreate, LogUpdate


async def create_log(db: AsyncSession, project_id: str, log_in: LogCreate) -> ProjectLog:
    db_log = ProjectLog(**log_in.model_dump(), project_id=project_id)
    db.add(db_log)

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if project:
        project.last_updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(db_log)
    return db_log


async def get_logs_by_project(db: AsyncSession, project_id: str) -> List[ProjectLog]:
    result = await db.execute(
        select(ProjectLog)
        .where(ProjectLog.project_id == project_id)
        .order_by(ProjectLog.created_at.desc())
    )
    return list(result.scalars().all())


async def get_global_activity_feed(
    db: AsyncSession,
    limit: int = 50,
    user_id: Optional[uuid.UUID] = None,
) -> List[ProjectLog]:
    stmt = (
        select(ProjectLog)
        .join(Project, ProjectLog.project_id == Project.id)
        .order_by(ProjectLog.created_at.desc())
        .limit(limit)
    )

    if user_id is not None:
        stmt = stmt.where(Project.user_id == user_id)
    else:
        stmt = stmt.where(Project.visibility == "Public")

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_log_by_id(db: AsyncSession, log_id: str) -> Optional[ProjectLog]:
    result = await db.execute(select(ProjectLog).where(ProjectLog.id == log_id))
    return result.scalars().first()


async def update_log(db: AsyncSession, log_id: str, log_in: LogUpdate) -> Optional[ProjectLog]:
    db_log = await get_log_by_id(db, log_id)
    if db_log:
        update_data = log_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_log, key, value)
        await db.commit()
        await db.refresh(db_log)
    return db_log


async def delete_log(db: AsyncSession, log_id: str) -> bool:
    db_log = await get_log_by_id(db, log_id)
    if db_log:
        await db.delete(db_log)
        await db.commit()
        return True
    return False
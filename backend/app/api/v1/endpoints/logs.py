from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.schemas.log import LogCreate, LogUpdate, LogResponse
from app.services import log_service, project_service
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter()


@router.get("/global/feed", response_model=List[LogResponse])
async def get_global_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    return await log_service.get_global_activity_feed(
        db, limit=limit, user_id=current_user.id if current_user else None
    )


@router.post("/{project_id}", response_model=LogResponse, status_code=status.HTTP_201_CREATED)
async def add_log_to_project(
    project_id: str,
    log_in: LogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await project_service.get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    return await log_service.create_log(db, project_id, log_in)


@router.get("/{project_id}", response_model=List[LogResponse])
async def get_project_changelog(
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

    return await log_service.get_logs_by_project(db, project_id)


@router.get("/detail/{log_id}", response_model=LogResponse)
async def get_log_detail(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    log = await log_service.get_log_by_id(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    project = await project_service.get_project_by_id(db, str(log.project_id))
    is_owner = current_user is not None and project and project.user_id == current_user.id
    if not is_owner and project and project.visibility == "Private":
        raise HTTPException(status_code=403, detail="Access denied")

    return log


@router.patch("/{log_id}", response_model=LogResponse)
async def edit_log(
    log_id: str,
    log_in: LogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await log_service.get_log_by_id(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    project = await project_service.get_project_by_id(db, str(log.project_id))
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return await log_service.update_log(db, log_id, log_in)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await log_service.get_log_by_id(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    project = await project_service.get_project_by_id(db, str(log.project_id))
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    await log_service.delete_log(db, log_id)
    return None
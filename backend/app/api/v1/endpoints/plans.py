from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse
from app.services import plan_service, project_service
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter()


@router.post("/{project_id}", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def add_plan_to_project(
    project_id: str,
    plan_in: PlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await project_service.get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    return await plan_service.create_plan(db, project_id, plan_in)


@router.get("/{project_id}", response_model=List[PlanResponse])
async def get_project_roadmap(
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

    return await plan_service.get_plans_by_project(db, project_id)


@router.patch("/{plan_id}/toggle", response_model=PlanResponse)
async def toggle_plan_status(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await plan_service.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    project = await project_service.get_project_by_id(db, str(plan.project_id))
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return await plan_service.toggle_plan_completion(db, plan_id)


@router.get("/detail/{plan_id}", response_model=PlanResponse)
async def get_plan_detail(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    plan = await plan_service.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    project = await project_service.get_project_by_id(db, str(plan.project_id))
    is_owner = current_user is not None and project and project.user_id == current_user.id
    if not is_owner and project and project.visibility == "Private":
        raise HTTPException(status_code=403, detail="Access denied")

    return plan


@router.patch("/{plan_id}", response_model=PlanResponse)
async def edit_plan(
    plan_id: str,
    plan_in: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await plan_service.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    project = await project_service.get_project_by_id(db, str(plan.project_id))
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return await plan_service.update_plan(db, plan_id, plan_in)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await plan_service.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    project = await project_service.get_project_by_id(db, str(plan.project_id))
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    await plan_service.delete_plan(db, plan_id)
    return None
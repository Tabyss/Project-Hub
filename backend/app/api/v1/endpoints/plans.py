from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse
from app.services import plan_service, project_service

router = APIRouter()

@router.post("/{project_id}", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def add_plan_to_project(project_id: str, plan_in: PlanCreate, db: AsyncSession = Depends(get_db)):
    project = await project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return await plan_service.create_plan(db, project_id, plan_in)

@router.get("/{project_id}", response_model=List[PlanResponse])
async def get_project_roadmap(project_id: str, db: AsyncSession = Depends(get_db)):
    return await plan_service.get_plans_by_project(db, project_id)

@router.patch("/{plan_id}/toggle", response_model=PlanResponse)
async def toggle_plan_status(plan_id: str, db: AsyncSession = Depends(get_db)):
    updated_plan = await plan_service.toggle_plan_completion(db, plan_id)
    if not updated_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return updated_plan

@router.get("/detail/{plan_id}", response_model=PlanResponse)
async def get_plan_detail(plan_id: str, db: AsyncSession = Depends(get_db)):
    plan = await plan_service.get_plan_by_id(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.patch("/{plan_id}", response_model=PlanResponse)
async def edit_plan(plan_id: str, plan_in: PlanUpdate, db: AsyncSession = Depends(get_db)):
    updated_plan = await plan_service.update_plan(db, plan_id, plan_in)
    if not updated_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return updated_plan

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_plan(plan_id: str, db: AsyncSession = Depends(get_db)):
    success = await plan_service.delete_plan(db, plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
    return None
# app/services/plan_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.plan import ProjectPlan
from app.schemas.plan import PlanCreate, PlanUpdate
from typing import List, Optional

async def create_plan(db: AsyncSession, project_id: str, plan_in: PlanCreate) -> ProjectPlan:
    db_plan = ProjectPlan(**plan_in.model_dump(), project_id=project_id)
    db.add(db_plan)
    await db.commit()
    await db.refresh(db_plan)
    return db_plan

async def get_plans_by_project(db: AsyncSession, project_id: str) -> List[ProjectPlan]:
    result = await db.execute(
        select(ProjectPlan)
        .where(ProjectPlan.project_id == project_id)
        .order_by(ProjectPlan.created_at.desc())
    )
    return result.scalars().all()

async def get_plan_by_id(db: AsyncSession, plan_id: str) -> Optional[ProjectPlan]:
    result = await db.execute(select(ProjectPlan).where(ProjectPlan.id == plan_id))
    return result.scalars().first()

async def toggle_plan_completion(db: AsyncSession, plan_id: str) -> Optional[ProjectPlan]:
    db_plan = await get_plan_by_id(db, plan_id)
    if db_plan:
        # Balikkan status is_completed (True ke False, False ke True)
        db_plan.is_completed = not db_plan.is_completed
        await db.commit()
        await db.refresh(db_plan)
    return db_plan

async def update_plan(db: AsyncSession, plan_id: str, plan_in: PlanUpdate) -> Optional[ProjectPlan]:
    db_plan = await get_plan_by_id(db, plan_id)
    if db_plan:
        update_data = plan_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_plan, key, value)
        await db.commit()
        await db.refresh(db_plan)
    return db_plan

async def delete_plan(db: AsyncSession, plan_id: str) -> bool:
    db_plan = await get_plan_by_id(db, plan_id)
    if db_plan:
        await db.delete(db_plan)
        await db.commit()
        return True
    return False
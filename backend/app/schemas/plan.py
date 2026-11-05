import uuid
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.plan import PriorityEnum

class PlanBase(BaseModel):
    task: str = Field(..., max_length=255)
    priority: PriorityEnum = PriorityEnum.Medium
    is_completed: bool = False

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    task: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    is_completed: Optional[bool] = None

class PlanResponse(PlanBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
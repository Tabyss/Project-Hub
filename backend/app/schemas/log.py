import uuid
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.log import LogTypeEnum

class LogBase(BaseModel):
    title: str = Field(..., max_length=255)
    version: Optional[str] = Field(None, max_length=50)
    details: Optional[str] = None
    log_type: LogTypeEnum = LogTypeEnum.feature

class LogCreate(LogBase):
    pass

class LogUpdate(BaseModel):
    title: Optional[str] = None
    version: Optional[str] = None
    details: Optional[str] = None
    log_type: Optional[LogTypeEnum] = None

class LogResponse(LogBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
import uuid 
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.project import VisibilityEnum, StatusEnum
from app.schemas.plan import PlanResponse
from app.schemas.log import LogResponse

class ProjectBase(BaseModel):
    title: str
    slug: str
    tagline: str
    category: list[str]
    visibility: str = "Public"
    status: str = "Active"
    is_favorite: bool = False
    role: str
    cover_img: str | None = None
    live_url: str | None = None
    tools: list[str] = []
    media_urls: list[str] = []

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    tagline: Optional[str] = None
    category: Optional[List[str]] = Field(None, max_length=3)
    visibility: Optional[VisibilityEnum] = None
    status: Optional[StatusEnum] = None
    is_favorite: Optional[bool] = None
    cover_img: Optional[str] = None
    repo_url: Optional[str] = None
    role: Optional[str] = None
    tools: Optional[List[str]] = None
    media_urls: Optional[List[str]] = None
    portfolio_content: Optional[str] = None
    documentation_content: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: UUID
    tools: List[str] = []
    media_urls: List[str] = []
    created_at: datetime
    last_updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
class PublicProjectResponse(ProjectBase):
    id: uuid.UUID
    portfolio_content: str | None = None
    created_at: datetime
    last_updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
class DevProjectResponse(PublicProjectResponse):
    repo_url: str | None = None
    documentation_content: str | None = None
    plans: list[PlanResponse] = []
    logs: list[LogResponse] = []
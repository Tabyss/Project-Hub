from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class FolderBase(BaseModel):
    name: str = Field(..., max_length=100)
    color: Optional[str] = Field(None, pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

class FolderResponse(FolderBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    notes_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class NoteBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255) 
    content: str = Field(...)
    is_pinned: bool = False
    folder_id: Optional[UUID] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    folder_id: Optional[UUID] = None

class NoteResponse(NoteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    folder: Optional[FolderResponse] = None

    model_config = ConfigDict(from_attributes=True)
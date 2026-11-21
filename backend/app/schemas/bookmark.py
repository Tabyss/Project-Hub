import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.bookmark import BookmarkTypeEnum


class BookmarkCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#18181B", max_length=20)


class BookmarkCategoryCreate(BookmarkCategoryBase):
    pass


class BookmarkCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=20)


class BookmarkCategoryResponse(BookmarkCategoryBase):
    id: uuid.UUID
    created_at: datetime
    bookmarks_count: int = 0

    model_config = {"from_attributes": True}


class CheckpointCreate(BaseModel):
    page_number: int = Field(..., ge=1)
    page_url: Optional[str] = None
    note: Optional[str] = None


class CheckpointResponse(BaseModel):
    id: uuid.UUID
    bookmark_id: uuid.UUID
    page_number: int
    page_url: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookmarkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    text: Optional[str] = None
    url: str = Field(..., min_length=1)
    bookmark_type: BookmarkTypeEnum = BookmarkTypeEnum.web
    category_id: Optional[uuid.UUID] = None
    total_pages: Optional[int] = Field(None, ge=1)
    initial_page: Optional[int] = Field(None, ge=1)


class BookmarkUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    text: Optional[str] = None
    url: Optional[str] = None
    bookmark_type: Optional[BookmarkTypeEnum] = None
    category_id: Optional[uuid.UUID] = None
    total_pages: Optional[int] = Field(None, ge=1)


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    title: str
    text: Optional[str] = None
    url: str
    bookmark_type: BookmarkTypeEnum
    category_id: Optional[uuid.UUID] = None
    category: Optional[BookmarkCategoryResponse] = None
    total_pages: Optional[int] = None
    checkpoints: List[CheckpointResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
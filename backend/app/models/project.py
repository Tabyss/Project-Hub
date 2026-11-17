import uuid
import enum
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, Enum as SQLEnum, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class VisibilityEnum(str, enum.Enum):
    Public = 'Public'
    Private = 'Private'


class StatusEnum(str, enum.Enum):
    Idea = 'Idea'
    In_Development = 'In Development'
    Active = 'Active'
    Maintained = 'Maintained'
    Paused = 'Paused'
    Archived = 'Archived'


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        UniqueConstraint("user_id", "slug", name="uq_user_project_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    tagline: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[list] = mapped_column(JSON, nullable=False)

    visibility: Mapped[VisibilityEnum] = mapped_column(SQLEnum(VisibilityEnum), default=VisibilityEnum.Public)
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum), default=StatusEnum.Active)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    cover_img: Mapped[str | None] = mapped_column(String, nullable=True)
    repo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    live_url: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String(100), nullable=False)

    portfolio_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    documentation_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    technologies = relationship("ProjectTechnology", back_populates="project", cascade="all, delete-orphan")
    media = relationship("ProjectMedia", back_populates="project", cascade="all, delete-orphan")
    plans = relationship("ProjectPlan", back_populates="project", cascade="all, delete-orphan")
    logs = relationship("ProjectLog", back_populates="project", cascade="all, delete-orphan")
import uuid
import enum
from sqlalchemy import String, ForeignKey, Enum as SQLEnum, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class PriorityEnum(str, enum.Enum):
    Low = 'Low'
    Medium = 'Medium'
    High = 'High'

class ProjectPlan(Base):
    __tablename__ = "project_plans"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    task: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[PriorityEnum] = mapped_column(SQLEnum(PriorityEnum), default=PriorityEnum.Medium)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="plans")
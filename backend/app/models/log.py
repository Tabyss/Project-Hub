import uuid
import enum
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class LogTypeEnum(str, enum.Enum):
    feature = 'feature'
    bugfix = 'bugfix'
    refactor = 'refactor'
    docs = 'docs'
    maintenance = 'maintenance'
    release = 'release'

class ProjectLog(Base):
    __tablename__ = "project_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    log_type: Mapped[LogTypeEnum] = mapped_column(SQLEnum(LogTypeEnum), default=LogTypeEnum.feature)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="logs")
    attachments = relationship("LogAttachment", back_populates="log", cascade="all, delete-orphan")

class LogAttachment(Base):
    __tablename__ = "log_attachments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    log_id: Mapped[str] = mapped_column(String, ForeignKey("project_logs.id", ondelete="CASCADE"), nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    caption: Mapped[str | None] = mapped_column(String, nullable=True)

    log = relationship("ProjectLog", back_populates="attachments")
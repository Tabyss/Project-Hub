import uuid
import enum
from sqlalchemy import String, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class MediaTypeEnum(str, enum.Enum):
    image = "image"
    gif = "gif"
    diagram = "diagram"


class ProjectMedia(Base):
    __tablename__ = "project_media"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String, nullable=False)
    caption: Mapped[str | None] = mapped_column(String, nullable=True)
    media_type: Mapped[MediaTypeEnum] = mapped_column(
        SQLEnum(MediaTypeEnum), default=MediaTypeEnum.image
    )
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    project = relationship("Project", back_populates="media")

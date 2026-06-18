import uuid
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace


class Canvas(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "canvases"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # bumped atomically on each operation append; 0 means no ops yet
    version_counter: Mapped[int] = mapped_column(
        BigInteger, nullable=False, default=0, server_default="0"
    )

    workspace: Mapped["Workspace"] = relationship(back_populates="canvases")

    def __repr__(self) -> str:
        return f"<Canvas id={self.id} name={self.name!r} ws={self.workspace_id}>"

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class Snapshot(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "snapshots"
    __table_args__ = (
        UniqueConstraint("canvas_id", "version", name="uq_snapshot_canvas_version"),
    )

    canvas_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("canvases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # state includes all ops up to and including this version
    version: Mapped[int] = mapped_column(BigInteger, nullable=False)
    # shape_id -> shape attributes
    state: Mapped[dict] = mapped_column(JSONB, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Snapshot canvas={self.canvas_id} v={self.version}>"

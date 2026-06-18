import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class OperationType(str, enum.Enum):
    create_shape = "create_shape"
    move_shape = "move_shape"
    resize_shape = "resize_shape"
    delete_shape = "delete_shape"


class Operation(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "operations"
    __table_args__ = (
        UniqueConstraint("canvas_id", "version", name="uq_operation_canvas_version"),
        # client_op_id is unique per canvas for idempotency; NULLs don't collide
        UniqueConstraint(
            "canvas_id", "client_op_id", name="uq_operation_canvas_client_op"
        ),
    )

    canvas_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("canvases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 1-based, gap-free per canvas
    version: Mapped[int] = mapped_column(BigInteger, nullable=False)

    op_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    client_op_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # for undo/redo: the operation this one reverses (NULL for normal content ops)
    undo_of: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("operations.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Operation canvas={self.canvas_id} v={self.version} "
            f"type={self.op_type}>"
        )

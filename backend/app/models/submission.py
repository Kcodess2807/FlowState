import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class Submission(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "submissions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    # optional serialized diagram (canvas nodes/edges)
    design: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="evaluated", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    evaluation: Mapped["Evaluation | None"] = relationship(
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Submission user={self.user_id} problem={self.problem_id}>"


class Evaluation(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "evaluations"

    submission_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    # list of {key, title, score, max, feedback}
    criteria: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    submission: Mapped["Submission"] = relationship(back_populates="evaluation")

    def __repr__(self) -> str:
        return f"<Evaluation sub={self.submission_id} {self.overall_score}/{self.max_score}>"

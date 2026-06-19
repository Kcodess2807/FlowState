import enum

from sqlalchemy import Boolean, Column, ForeignKey, String, Table, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.topic import Topic


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


problem_topics = Table(
    "problem_topics",
    Base.metadata,
    Column(
        "problem_id",
        PG_UUID(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "topic_id",
        PG_UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Problem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "problems"

    slug: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(
        SAEnum(Difficulty, name="difficulty"), nullable=False, index=True
    )
    # list of {key, title, description, weight} criteria the AI grades against
    rubric: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    reference_solution: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False, index=True
    )

    topics: Mapped[list[Topic]] = relationship(
        secondary=problem_topics, lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Problem {self.slug} ({self.difficulty.value})>"

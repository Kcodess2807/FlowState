from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


# a system-design concept used to tag problems (caching, sharding, queues, ...)
class Topic(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "topics"

    slug: Mapped[str] = mapped_column(
        String(80), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    def __repr__(self) -> str:
        return f"<Topic {self.slug}>"

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.problem import Difficulty
from app.schemas.topic import TopicRead


class RubricCriterion(BaseModel):
    key: str = Field(min_length=1, max_length=60)
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=1000)
    weight: int = Field(ge=1, le=100)


class ProblemCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    difficulty: Difficulty
    rubric: list[RubricCriterion] = Field(default_factory=list)
    reference_solution: str | None = None
    is_published: bool = False
    topic_slugs: list[str] = Field(default_factory=list)


class ProblemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    difficulty: Difficulty | None = None
    rubric: list[RubricCriterion] | None = None
    reference_solution: str | None = None
    is_published: bool | None = None
    topic_slugs: list[str] | None = None


# compact shape for list views
class ProblemSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    difficulty: Difficulty
    is_published: bool
    topics: list[TopicRead]


class ProblemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    description: str
    difficulty: Difficulty
    rubric: list[RubricCriterion]
    reference_solution: str | None
    is_published: bool
    topics: list[TopicRead]
    created_at: datetime

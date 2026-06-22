import uuid

from pydantic import BaseModel, ConfigDict, Field


class TopicCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=120)


class TopicRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str

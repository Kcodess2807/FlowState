import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CanvasCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class CanvasRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    created_by: uuid.UUID | None
    created_at: datetime

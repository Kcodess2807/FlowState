import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CanvasVersionCreate(BaseModel):
    label: str = Field(min_length=1, max_length=120)


class CanvasVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    canvas_id: uuid.UUID
    version: int
    label: str
    created_by: uuid.UUID | None
    created_at: datetime


class StateDiff(BaseModel):
    added: dict[str, Any]
    removed: dict[str, Any]
    modified: dict[str, Any]


class RestoreRequest(BaseModel):
    target_version: int = Field(ge=0)


class RestoreResult(BaseModel):
    canvas_id: uuid.UUID
    version: int
    operations_applied: int

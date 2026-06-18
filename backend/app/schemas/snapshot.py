import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class SnapshotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    canvas_id: uuid.UUID
    version: int
    created_at: datetime


class CanvasStateRead(BaseModel):
    canvas_id: uuid.UUID
    version: int
    shapes: dict[str, Any]

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.operation import OperationType


class OperationCreate(BaseModel):
    type: OperationType
    payload: dict[str, Any] = Field(default_factory=dict)
    client_op_id: str | None = Field(default=None, max_length=100)


class OperationRead(BaseModel):
    # map the ORM's op_type onto the public "type" field
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    canvas_id: uuid.UUID
    version: int
    type: OperationType = Field(validation_alias="op_type")
    payload: dict[str, Any]
    created_by: uuid.UUID | None
    client_op_id: str | None
    created_at: datetime

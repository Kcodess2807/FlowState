import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SubmissionCreate(BaseModel):
    explanation: str = Field(min_length=1, max_length=20000)
    design: dict[str, Any] | None = None


class CriterionResult(BaseModel):
    key: str
    title: str
    score: int
    max: int
    feedback: str


class EvaluationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_score: int
    max_score: int
    passed: bool
    summary: str
    criteria: list[CriterionResult]
    model: str
    created_at: datetime


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    problem_id: uuid.UUID
    status: str
    explanation: str
    created_at: datetime
    evaluation: EvaluationRead | None = None


# list view, omits the full explanation body
class SubmissionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    problem_id: uuid.UUID
    status: str
    created_at: datetime
    evaluation: EvaluationRead | None = None

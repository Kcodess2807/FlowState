import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.problem import Problem
from app.models.submission import Evaluation, Submission
from app.services.grader import grade_submission


async def create_submission(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    problem: Problem,
    explanation: str,
    design: dict | None,
) -> Submission:
    submission = Submission(
        user_id=user_id,
        problem_id=problem.id,
        explanation=explanation,
        design=design,
        status="evaluated",
    )

    result = await grade_submission(problem, explanation, design)
    submission.evaluation = Evaluation(
        overall_score=result["overall_score"],
        max_score=result["max_score"],
        passed=result["passed"],
        summary=result["summary"],
        criteria=result["criteria"],
        model=result["model"],
    )

    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return submission


async def get_submission(
    db: AsyncSession, submission_id: uuid.UUID
) -> Submission | None:
    return await db.get(Submission, submission_id)


async def list_user_submissions(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    problem_id: uuid.UUID | None = None,
) -> list[Submission]:
    stmt = select(Submission).where(Submission.user_id == user_id)
    if problem_id is not None:
        stmt = stmt.where(Submission.problem_id == problem_id)
    stmt = stmt.order_by(Submission.created_at.desc())
    return list((await db.execute(stmt)).scalars().all())

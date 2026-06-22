import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionRead,
    SubmissionSummary,
)
from app.services.problem import get_problem_by_slug
from app.services.submission import (
    create_submission,
    get_submission,
    list_user_submissions,
)

router = APIRouter(tags=["submissions"])


async def _accessible_problem(db, slug: str, user: User):
    problem = await get_problem_by_slug(db, slug)
    if problem is None or (not problem.is_published and not user.is_staff):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found."
        )
    return problem


@router.post(
    "/problems/{slug}/submissions",
    response_model=SubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
async def submit_solution(
    slug: str,
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    problem = await _accessible_problem(db, slug, current_user)
    return await create_submission(
        db,
        user_id=current_user.id,
        problem=problem,
        explanation=payload.explanation,
        design=payload.design,
    )


@router.get(
    "/problems/{slug}/submissions", response_model=list[SubmissionSummary]
)
async def my_problem_submissions(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    problem = await _accessible_problem(db, slug, current_user)
    return await list_user_submissions(
        db, current_user.id, problem_id=problem.id
    )


@router.get("/me/submissions", response_model=list[SubmissionSummary])
async def my_submissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_user_submissions(db, current_user.id)


@router.get("/submissions/{submission_id}", response_model=SubmissionRead)
async def get_one_submission(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    submission = await get_submission(db, submission_id)
    if submission is None or submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )
    return submission

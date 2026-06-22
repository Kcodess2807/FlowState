from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_staff
from app.core.database import get_db
from app.models.problem import Difficulty
from app.models.user import User
from app.schemas.problem import (
    ProblemCreate,
    ProblemRead,
    ProblemSummary,
    ProblemUpdate,
)
from app.services.problem import (
    ProblemSlugExistsError,
    create_problem,
    delete_problem,
    get_problem_by_slug,
    list_problems,
    update_problem,
)

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=list[ProblemSummary])
async def get_problems(
    difficulty: Difficulty | None = Query(None),
    topic: str | None = Query(None),
    search: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # only staff see unpublished drafts
    return await list_problems(
        db,
        include_unpublished=current_user.is_staff,
        difficulty=difficulty,
        topic_slug=topic,
        search=search,
    )


@router.get("/{slug}", response_model=ProblemRead)
async def get_problem(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    problem = await get_problem_by_slug(db, slug)
    if problem is None or (not problem.is_published and not current_user.is_staff):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found."
        )
    return problem


@router.post("", response_model=ProblemRead, status_code=status.HTTP_201_CREATED)
async def add_problem(
    payload: ProblemCreate,
    _: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await create_problem(
            db,
            slug=payload.slug,
            title=payload.title,
            description=payload.description,
            difficulty=payload.difficulty,
            rubric=[c.model_dump() for c in payload.rubric],
            reference_solution=payload.reference_solution,
            is_published=payload.is_published,
            topic_slugs=payload.topic_slugs,
        )
    except ProblemSlugExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A problem with this slug already exists.",
        )


@router.patch("/{slug}", response_model=ProblemRead)
async def edit_problem(
    slug: str,
    payload: ProblemUpdate,
    _: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    problem = await get_problem_by_slug(db, slug)
    if problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found."
        )
    fields = payload.model_dump(exclude_unset=True)
    if "rubric" in fields and fields["rubric"] is not None:
        fields["rubric"] = [
            c if isinstance(c, dict) else c.model_dump() for c in fields["rubric"]
        ]
    return await update_problem(db, problem, fields)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_problem(
    slug: str,
    _: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    problem = await get_problem_by_slug(db, slug)
    if problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found."
        )
    await delete_problem(db, problem)

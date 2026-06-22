from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.problem import Difficulty, Problem
from app.services.topic import get_topics_by_slugs


class ProblemSlugExistsError(Exception):
    pass


async def get_problem_by_slug(db: AsyncSession, slug: str) -> Problem | None:
    result = await db.execute(select(Problem).where(Problem.slug == slug))
    return result.scalar_one_or_none()


async def create_problem(
    db: AsyncSession,
    *,
    slug: str,
    title: str,
    description: str,
    difficulty: Difficulty,
    rubric: list[dict],
    reference_solution: str | None,
    is_published: bool,
    topic_slugs: list[str],
) -> Problem:
    slug = slug.strip().lower()
    if await get_problem_by_slug(db, slug) is not None:
        raise ProblemSlugExistsError(slug)

    problem = Problem(
        slug=slug,
        title=title.strip(),
        description=description,
        difficulty=difficulty,
        rubric=rubric,
        reference_solution=reference_solution,
        is_published=is_published,
    )
    problem.topics = await get_topics_by_slugs(db, topic_slugs)
    db.add(problem)
    await db.flush()
    await db.refresh(problem)
    return problem


async def update_problem(
    db: AsyncSession, problem: Problem, fields: dict
) -> Problem:
    topic_slugs = fields.pop("topic_slugs", None)
    for key, value in fields.items():
        setattr(problem, key, value)
    if topic_slugs is not None:
        problem.topics = await get_topics_by_slugs(db, topic_slugs)
    await db.flush()
    await db.refresh(problem)
    return problem


async def delete_problem(db: AsyncSession, problem: Problem) -> None:
    await db.delete(problem)
    await db.flush()


async def list_problems(
    db: AsyncSession,
    *,
    include_unpublished: bool,
    difficulty: Difficulty | None = None,
    topic_slug: str | None = None,
    search: str | None = None,
) -> list[Problem]:
    stmt = select(Problem)
    if not include_unpublished:
        stmt = stmt.where(Problem.is_published.is_(True))
    if difficulty is not None:
        stmt = stmt.where(Problem.difficulty == difficulty)
    if search:
        stmt = stmt.where(Problem.title.ilike(f"%{search.strip()}%"))
    if topic_slug:
        stmt = stmt.where(
            Problem.topics.any(slug=topic_slug.strip().lower())
        )
    stmt = stmt.order_by(Problem.created_at)
    result = await db.execute(stmt)
    return list(result.scalars().unique().all())

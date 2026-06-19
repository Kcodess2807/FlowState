from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.topic import Topic


class TopicSlugExistsError(Exception):
    pass


async def create_topic(db: AsyncSession, *, slug: str, name: str) -> Topic:
    slug = slug.strip().lower()
    if await get_topic_by_slug(db, slug) is not None:
        raise TopicSlugExistsError(slug)
    topic = Topic(slug=slug, name=name.strip())
    db.add(topic)
    await db.flush()
    await db.refresh(topic)
    return topic


async def get_topic_by_slug(db: AsyncSession, slug: str) -> Topic | None:
    result = await db.execute(select(Topic).where(Topic.slug == slug))
    return result.scalar_one_or_none()


async def list_topics(db: AsyncSession) -> list[Topic]:
    result = await db.execute(select(Topic).order_by(Topic.name))
    return list(result.scalars().all())


async def get_topics_by_slugs(db: AsyncSession, slugs: list[str]) -> list[Topic]:
    if not slugs:
        return []
    normalized = [s.strip().lower() for s in slugs]
    result = await db.execute(select(Topic).where(Topic.slug.in_(normalized)))
    return list(result.scalars().all())

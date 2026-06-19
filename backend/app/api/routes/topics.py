from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_staff
from app.core.database import get_db
from app.models.user import User
from app.schemas.topic import TopicCreate, TopicRead
from app.services.topic import TopicSlugExistsError, create_topic, list_topics

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=list[TopicRead])
async def get_topics(db: AsyncSession = Depends(get_db)):
    return await list_topics(db)


@router.post("", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
async def add_topic(
    payload: TopicCreate,
    _: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await create_topic(db, slug=payload.slug, name=payload.name)
    except TopicSlugExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A topic with this slug already exists.",
        )

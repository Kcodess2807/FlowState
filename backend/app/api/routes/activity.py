import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.activity import ActivitySummary
from app.services.activity import get_user_activity
from app.services.user import get_user_by_id

router = APIRouter(tags=["activity"])


@router.get("/me/activity", response_model=ActivitySummary)
async def my_activity(
    year: int | None = Query(None, ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_activity(db, current_user.id, year=year)


@router.get("/users/{user_id}/activity", response_model=ActivitySummary)
async def user_activity(
    user_id: uuid.UUID,
    year: int | None = Query(None, ge=2000, le=2100),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await get_user_by_id(db, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return await get_user_activity(db, user_id, year=year)

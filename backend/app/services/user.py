import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User


class EmailAlreadyExistsError(Exception):
    pass


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession, *, email: str, password: str, display_name: str
) -> User:
    email = email.strip().lower()
    if await get_user_by_email(db, email) is not None:
        raise EmailAlreadyExistsError(email)

    user = User(
        email=email,
        hashed_password=hash_password(password),
        display_name=display_name.strip(),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, *, email: str, password: str
) -> User | None:
    user = await get_user_by_email(db, email.strip().lower())
    if user is None:
        # waste a hash to keep timing constant and avoid user enumeration
        verify_password(password, "$2b$12$" + "x" * 53)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

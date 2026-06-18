import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.canvas import Canvas


async def create_canvas(
    db: AsyncSession,
    *,
    workspace_id: uuid.UUID,
    name: str,
    created_by: uuid.UUID,
) -> Canvas:
    canvas = Canvas(
        workspace_id=workspace_id,
        name=name.strip(),
        created_by=created_by,
    )
    db.add(canvas)
    await db.flush()
    await db.refresh(canvas)
    return canvas


async def get_canvas(db: AsyncSession, canvas_id: uuid.UUID) -> Canvas | None:
    return await db.get(Canvas, canvas_id)


async def list_canvases(
    db: AsyncSession, workspace_id: uuid.UUID
) -> list[Canvas]:
    stmt = (
        select(Canvas)
        .where(Canvas.workspace_id == workspace_id)
        .order_by(Canvas.created_at)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

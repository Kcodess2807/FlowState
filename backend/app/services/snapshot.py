import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.snapshot import Snapshot
from app.services.operation import list_operations
from app.services.reducer import CanvasState, build_state


async def get_latest_snapshot(
    db: AsyncSession,
    canvas_id: uuid.UUID,
    *,
    max_version: int | None = None,
) -> Snapshot | None:
    stmt = select(Snapshot).where(Snapshot.canvas_id == canvas_id)
    if max_version is not None:
        stmt = stmt.where(Snapshot.version <= max_version)
    stmt = stmt.order_by(Snapshot.version.desc()).limit(1)
    return (await db.execute(stmt)).scalar_one_or_none()


async def list_snapshots(
    db: AsyncSession, canvas_id: uuid.UUID
) -> list[Snapshot]:
    stmt = (
        select(Snapshot)
        .where(Snapshot.canvas_id == canvas_id)
        .order_by(Snapshot.version)
    )
    return list((await db.execute(stmt)).scalars().all())


async def reconstruct_state(
    db: AsyncSession,
    canvas_id: uuid.UUID,
    *,
    at_version: int | None = None,
) -> tuple[CanvasState, int]:
    # newest snapshot that doesn't overshoot the target, then replay the tail
    snapshot = await get_latest_snapshot(db, canvas_id, max_version=at_version)
    base_state = snapshot.state if snapshot is not None else {}
    base_version = snapshot.version if snapshot is not None else 0

    operations = await list_operations(
        db,
        canvas_id,
        since_version=base_version,
        until_version=at_version,
    )
    state = build_state(operations, base_state)

    final_version = operations[-1].version if operations else base_version
    return state, final_version


async def create_snapshot(
    db: AsyncSession, canvas_id: uuid.UUID
) -> Snapshot:
    state, version = await reconstruct_state(db, canvas_id)

    latest = await get_latest_snapshot(db, canvas_id)
    if latest is not None and latest.version == version:
        return latest

    snapshot = Snapshot(canvas_id=canvas_id, version=version, state=state)
    db.add(snapshot)
    await db.flush()
    await db.refresh(snapshot)
    return snapshot


async def maybe_auto_snapshot(
    db: AsyncSession, canvas_id: uuid.UUID, version: int
) -> None:
    interval = settings.SNAPSHOT_EVERY_N_OPS
    if interval > 0 and version > 0 and version % interval == 0:
        await create_snapshot(db, canvas_id)

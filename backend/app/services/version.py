import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operation import OperationType
from app.models.version import CanvasVersion
from app.services.operation import append_operation
from app.services.reducer import diff_state
from app.services.snapshot import create_snapshot, reconstruct_state


async def create_version(
    db: AsyncSession,
    *,
    canvas_id: uuid.UUID,
    label: str,
    created_by: uuid.UUID,
) -> CanvasVersion:
    # snapshot the current state so the checkpoint is a fast restore anchor
    snapshot = await create_snapshot(db, canvas_id)
    version = CanvasVersion(
        canvas_id=canvas_id,
        version=snapshot.version,
        label=label.strip(),
        created_by=created_by,
    )
    db.add(version)
    await db.flush()
    await db.refresh(version)
    return version


async def list_versions(
    db: AsyncSession, canvas_id: uuid.UUID
) -> list[CanvasVersion]:
    stmt = (
        select(CanvasVersion)
        .where(CanvasVersion.canvas_id == canvas_id)
        .order_by(CanvasVersion.version, CanvasVersion.created_at)
    )
    return list((await db.execute(stmt)).scalars().all())


async def diff_versions(
    db: AsyncSession,
    canvas_id: uuid.UUID,
    *,
    from_version: int,
    to_version: int | None,
) -> dict:
    old, _ = await reconstruct_state(db, canvas_id, at_version=from_version)
    new, _ = await reconstruct_state(db, canvas_id, at_version=to_version)
    return diff_state(old, new)


async def restore_to_version(
    db: AsyncSession,
    canvas_id: uuid.UUID,
    *,
    target_version: int,
    user_id: uuid.UUID,
) -> tuple[int, int]:
    # Immutable restore: instead of rewriting history, emit new forward ops that
    # transform current state into the target state. Returns (new_version, ops).
    current, _ = await reconstruct_state(db, canvas_id)
    target, _ = await reconstruct_state(db, canvas_id, at_version=target_version)
    diff = diff_state(current, target)

    ops = 0

    for shape_id in diff["removed"]:
        await append_operation(
            db,
            canvas_id=canvas_id,
            op_type=OperationType.delete_shape,
            payload={"shape_id": shape_id},
            user_id=user_id,
        )
        ops += 1

    # create_shape acts as an upsert in the reducer, so it covers both new and
    # modified shapes — set each to its full target attributes.
    to_write = dict(diff["added"])
    to_write.update({sid: ch["after"] for sid, ch in diff["modified"].items()})
    for shape_id, shape in to_write.items():
        payload = {**shape, "shape_id": shape_id}
        await append_operation(
            db,
            canvas_id=canvas_id,
            op_type=OperationType.create_shape,
            payload=payload,
            user_id=user_id,
        )
        ops += 1

    _, new_version = await reconstruct_state(db, canvas_id)
    return new_version, ops

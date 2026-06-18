import uuid
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.canvas import Canvas
from app.models.operation import Operation, OperationType


async def _next_version(db: AsyncSession, canvas_id: uuid.UUID) -> int:
    # UPDATE ... RETURNING takes a row lock on the canvas, so concurrent appends
    # are serialized and each gets a distinct increasing version. The lock holds
    # until the surrounding transaction commits.
    stmt = (
        update(Canvas)
        .where(Canvas.id == canvas_id)
        .values(version_counter=Canvas.version_counter + 1)
        .returning(Canvas.version_counter)
    )
    new_version = (await db.execute(stmt)).scalar_one()
    return int(new_version)


async def get_operation_by_client_op_id(
    db: AsyncSession, canvas_id: uuid.UUID, client_op_id: str
) -> Operation | None:
    stmt = select(Operation).where(
        Operation.canvas_id == canvas_id,
        Operation.client_op_id == client_op_id,
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def append_operation(
    db: AsyncSession,
    *,
    canvas_id: uuid.UUID,
    op_type: OperationType,
    payload: dict[str, Any],
    user_id: uuid.UUID,
    client_op_id: str | None = None,
    undo_of: uuid.UUID | None = None,
) -> tuple[Operation, bool]:
    # returns (operation, created); created is False when deduped on client_op_id
    if client_op_id is not None:
        existing = await get_operation_by_client_op_id(
            db, canvas_id, client_op_id
        )
        if existing is not None:
            return existing, False

    version = await _next_version(db, canvas_id)
    operation = Operation(
        canvas_id=canvas_id,
        version=version,
        op_type=op_type.value,
        payload=payload,
        created_by=user_id,
        client_op_id=client_op_id,
        undo_of=undo_of,
    )
    db.add(operation)
    await db.flush()
    await db.refresh(operation)

    # lazy import to avoid a cycle (snapshot depends on list_operations)
    from app.services.snapshot import maybe_auto_snapshot

    await maybe_auto_snapshot(db, canvas_id, version)

    return operation, True


async def list_operations(
    db: AsyncSession,
    canvas_id: uuid.UUID,
    *,
    since_version: int = 0,
    until_version: int | None = None,
    limit: int | None = None,
) -> list[Operation]:
    stmt = select(Operation).where(
        Operation.canvas_id == canvas_id,
        Operation.version > since_version,
    )
    if until_version is not None:
        stmt = stmt.where(Operation.version <= until_version)
    stmt = stmt.order_by(Operation.version)
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

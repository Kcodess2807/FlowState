import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operation import Operation, OperationType
from app.services.operation import append_operation
from app.services.reducer import CanvasState
from app.services.snapshot import reconstruct_state


# inverse of an op given the state right before it applied; None means no-op
def inverse_of(
    op: Operation, state_before: CanvasState
) -> tuple[OperationType, dict[str, Any]] | None:
    shape_id = op.payload.get("shape_id")
    if shape_id is None:
        return None

    existed = shape_id in state_before

    if op.op_type == OperationType.create_shape.value:
        if existed:
            # create was an overwrite -> restore the prior shape
            return OperationType.create_shape, {
                **state_before[shape_id],
                "shape_id": shape_id,
            }
        return OperationType.delete_shape, {"shape_id": shape_id}

    if op.op_type in (
        OperationType.move_shape.value,
        OperationType.resize_shape.value,
    ):
        if not existed:
            return None
        prior = state_before[shape_id]
        restore = {"shape_id": shape_id}
        for key in op.payload:
            if key != "shape_id" and key in prior:
                restore[key] = prior[key]
        if len(restore) == 1:  # nothing to put back
            return None
        return OperationType(op.op_type), restore

    if op.op_type == OperationType.delete_shape.value:
        if existed:
            return OperationType.create_shape, {
                **state_before[shape_id],
                "shape_id": shape_id,
            }
        return None

    return None


async def _user_ops(
    db: AsyncSession, canvas_id: uuid.UUID, user_id: uuid.UUID
) -> list[Operation]:
    stmt = (
        select(Operation)
        .where(
            Operation.canvas_id == canvas_id,
            Operation.created_by == user_id,
        )
        .order_by(Operation.version)
    )
    return list((await db.execute(stmt)).scalars().all())


# rebuild the user's undo/redo stacks from their op history.
# linear undo: new content clears redo; undo moves a content op from undo to
# redo; redo (an undo of an undo) moves it back.
def _build_stacks(
    ops: list[Operation],
) -> tuple[list[Operation], list[Operation]]:
    by_id = {op.id: op for op in ops}
    undo_stack: list[Operation] = []
    redo_stack: list[Operation] = []

    for op in ops:
        if op.undo_of is None:
            undo_stack.append(op)
            redo_stack.clear()
            continue

        target = by_id.get(op.undo_of)
        if target is None:
            continue

        if target.undo_of is None:
            # undo of a content op
            if target in undo_stack:
                undo_stack.remove(target)
            redo_stack.append(target)
        else:
            # redo: undo of an undo -> reactivate the original content op
            content = by_id.get(target.undo_of)
            if content is None:
                continue
            if content in redo_stack:
                redo_stack.remove(content)
            undo_stack.append(content)

    return undo_stack, redo_stack


async def _latest_undo_op(
    db: AsyncSession, canvas_id: uuid.UUID, user_id: uuid.UUID, content_id: uuid.UUID
) -> Operation | None:
    stmt = (
        select(Operation)
        .where(
            Operation.canvas_id == canvas_id,
            Operation.created_by == user_id,
            Operation.undo_of == content_id,
        )
        .order_by(Operation.version.desc())
        .limit(1)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def perform_undo(
    db: AsyncSession, canvas_id: uuid.UUID, user_id: uuid.UUID
) -> Operation | None:
    undo_stack, _ = _build_stacks(await _user_ops(db, canvas_id, user_id))
    if not undo_stack:
        return None

    content = undo_stack[-1]
    state_before, _ = await reconstruct_state(
        db, canvas_id, at_version=content.version - 1
    )
    inverse = inverse_of(content, state_before)
    if inverse is None:
        return None

    op_type, payload = inverse
    operation, _ = await append_operation(
        db,
        canvas_id=canvas_id,
        op_type=op_type,
        payload=payload,
        user_id=user_id,
        undo_of=content.id,
    )
    return operation


async def perform_redo(
    db: AsyncSession, canvas_id: uuid.UUID, user_id: uuid.UUID
) -> Operation | None:
    _, redo_stack = _build_stacks(await _user_ops(db, canvas_id, user_id))
    if not redo_stack:
        return None

    content = redo_stack[-1]
    undo_op = await _latest_undo_op(db, canvas_id, user_id, content.id)
    if undo_op is None:
        return None

    # re-apply the content op's original effect; tag it as undoing the undo op
    operation, _ = await append_operation(
        db,
        canvas_id=canvas_id,
        op_type=OperationType(content.op_type),
        payload=dict(content.payload),
        user_id=user_id,
        undo_of=undo_op.id,
    )
    return operation

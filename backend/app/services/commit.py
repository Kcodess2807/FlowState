import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operation import Operation, OperationType
from app.realtime.manager import room_manager
from app.schemas.operation import OperationRead
from app.services.operation import append_operation


def _op_message(operation: Operation) -> dict:
    return {
        "type": "operation",
        "operation": OperationRead.model_validate(operation).model_dump(mode="json"),
    }


async def broadcast_operation(canvas_id: uuid.UUID, operation: Operation) -> None:
    await room_manager.broadcast(canvas_id, _op_message(operation))


# the single write path: append, commit, then push to the live room so REST,
# WebSocket, restore and undo/redo all stay convergent
async def commit_and_broadcast(
    db: AsyncSession,
    *,
    canvas_id: uuid.UUID,
    op_type: OperationType,
    payload: dict[str, Any],
    user_id: uuid.UUID,
    client_op_id: str | None = None,
) -> tuple[Operation, bool]:
    operation, created = await append_operation(
        db,
        canvas_id=canvas_id,
        op_type=op_type,
        payload=payload,
        user_id=user_id,
        client_op_id=client_op_id,
    )
    await db.commit()
    await broadcast_operation(canvas_id, operation)
    return operation, created

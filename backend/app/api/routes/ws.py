import asyncio
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from app.core.database import AsyncSessionLocal
from app.core.security import InvalidTokenError, decode_token
from app.models.operation import OperationType
from app.models.workspace import ROLE_ORDER, WorkspaceRole
from app.realtime.manager import Connection, room_manager
from app.schemas.operation import OperationRead
from app.services.canvas import get_canvas
from app.services.operation import append_operation, list_operations
from app.services.user import get_user_by_id
from app.services.workspace import get_membership

router = APIRouter(tags=["realtime"])

# drop a connection that hasn't sent anything (incl. pings) within this window
HEARTBEAT_TIMEOUT_SECONDS = 60
SYNC_REPLAY_LIMIT = 1000


async def _authenticate(token: str, canvas_id: uuid.UUID):
    async with AsyncSessionLocal() as db:
        try:
            payload = decode_token(token, expected_type="access")
            user_id = uuid.UUID(payload["sub"])
        except (InvalidTokenError, ValueError, KeyError):
            return None

        user = await get_user_by_id(db, user_id)
        if user is None or not user.is_active:
            return None

        canvas = await get_canvas(db, canvas_id)
        if canvas is None:
            return None

        membership = await get_membership(db, canvas.workspace_id, user_id)
        if membership is None:
            return None

        return user, membership


def _op_to_dict(operation) -> dict:
    return OperationRead.model_validate(operation).model_dump(mode="json")


@router.websocket("/canvases/{canvas_id}/ws")
async def canvas_ws(
    websocket: WebSocket,
    canvas_id: uuid.UUID,
    token: str = Query(...),
    since: int = Query(0, ge=0),
) -> None:
    auth = await _authenticate(token, canvas_id)
    if auth is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    user, membership = auth

    await websocket.accept()
    connection = Connection(
        id=uuid.uuid4(),
        websocket=websocket,
        user_id=user.id,
        display_name=user.display_name,
        role=membership.role.value,
    )
    await room_manager.add(canvas_id, connection)

    try:
        await _send_initial_sync(websocket, canvas_id, since, user, membership)
        await room_manager.broadcast(
            canvas_id,
            {
                "type": "presence_join",
                "user": {
                    "user_id": str(user.id),
                    "display_name": user.display_name,
                },
            },
            exclude=connection.id,
        )
        await _receive_loop(connection, canvas_id, membership)
    except WebSocketDisconnect:
        pass
    finally:
        await room_manager.remove(canvas_id, connection.id)
        if not room_manager.has_user(canvas_id, user.id):
            await room_manager.broadcast(
                canvas_id,
                {"type": "presence_leave", "user_id": str(user.id)},
            )


async def _send_initial_sync(
    websocket: WebSocket,
    canvas_id: uuid.UUID,
    since: int,
    user,
    membership,
) -> None:
    async with AsyncSessionLocal() as db:
        canvas = await get_canvas(db, canvas_id)
        current_version = canvas.version_counter if canvas else 0
        missed = await list_operations(
            db, canvas_id, since_version=since, limit=SYNC_REPLAY_LIMIT
        )
        operations = [_op_to_dict(op) for op in missed]

    await websocket.send_json(
        {
            "type": "sync",
            "canvas_id": str(canvas_id),
            "current_version": current_version,
            "operations": operations,
            "presence": room_manager.presence(canvas_id),
            "you": {
                "user_id": str(user.id),
                "display_name": user.display_name,
                "role": membership.role.value,
            },
        }
    )


async def _receive_loop(connection: Connection, canvas_id, membership) -> None:
    websocket = connection.websocket
    while True:
        try:
            message = await asyncio.wait_for(
                websocket.receive_json(), timeout=HEARTBEAT_TIMEOUT_SECONDS
            )
        except asyncio.TimeoutError:
            await websocket.close(code=status.WS_1001_GOING_AWAY)
            return
        except ValueError:
            await _send_error(websocket, "Invalid JSON.")
            continue

        await _handle_message(connection, canvas_id, membership, message)


async def _handle_message(connection, canvas_id, membership, message) -> None:
    websocket = connection.websocket
    msg_type = message.get("type") if isinstance(message, dict) else None

    if msg_type == "ping":
        await websocket.send_json({"type": "pong"})
        return

    if msg_type == "cursor":
        await room_manager.broadcast(
            canvas_id,
            {
                "type": "cursor",
                "user_id": str(connection.user_id),
                "x": message.get("x"),
                "y": message.get("y"),
            },
            exclude=connection.id,
        )
        return

    if msg_type == "operation":
        await _handle_operation(connection, canvas_id, membership, message)
        return

    await _send_error(websocket, f"Unknown message type: {msg_type!r}")


async def _handle_operation(connection, canvas_id, membership, message) -> None:
    websocket = connection.websocket

    if ROLE_ORDER[membership.role] < ROLE_ORDER[WorkspaceRole.editor]:
        await _send_error(
            websocket, "Requires 'editor' role or higher to commit operations."
        )
        return

    try:
        op_type = OperationType(message["op_type"])
    except (KeyError, ValueError):
        await _send_error(websocket, "Invalid or missing 'op_type'.")
        return

    payload = message.get("payload") or {}
    client_op_id = message.get("client_op_id")

    async with AsyncSessionLocal() as db:
        operation, created = await append_operation(
            db,
            canvas_id=canvas_id,
            op_type=op_type,
            payload=payload,
            user_id=connection.user_id,
            client_op_id=client_op_id,
        )
        await db.commit()
        op_dict = _op_to_dict(operation)

    # fan out to everyone including the sender so it learns the assigned version
    await room_manager.broadcast(
        canvas_id, {"type": "operation", "operation": op_dict}
    )


async def _send_error(websocket: WebSocket, detail: str) -> None:
    try:
        await websocket.send_json({"type": "error", "detail": detail})
    except Exception:
        pass

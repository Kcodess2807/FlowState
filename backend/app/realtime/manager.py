import asyncio
import uuid
from dataclasses import dataclass

from fastapi import WebSocket


@dataclass
class Connection:
    id: uuid.UUID
    websocket: WebSocket
    user_id: uuid.UUID
    display_name: str
    role: str


class Room:
    def __init__(self, canvas_id: uuid.UUID) -> None:
        self.canvas_id = canvas_id
        self.connections: dict[uuid.UUID, Connection] = {}
        self.lock = asyncio.Lock()


# in-memory rooms, one per canvas; single-instance only (no Redis yet)
class RoomManager:
    def __init__(self) -> None:
        self._rooms: dict[uuid.UUID, Room] = {}
        self._lock = asyncio.Lock()

    async def add(self, canvas_id: uuid.UUID, connection: Connection) -> Room:
        async with self._lock:
            room = self._rooms.get(canvas_id)
            if room is None:
                room = Room(canvas_id)
                self._rooms[canvas_id] = room
        async with room.lock:
            room.connections[connection.id] = connection
        return room

    async def remove(self, canvas_id: uuid.UUID, connection_id: uuid.UUID) -> None:
        room = self._rooms.get(canvas_id)
        if room is None:
            return
        async with room.lock:
            room.connections.pop(connection_id, None)
            is_empty = not room.connections
        if is_empty:
            async with self._lock:
                existing = self._rooms.get(canvas_id)
                if existing is not None and not existing.connections:
                    del self._rooms[canvas_id]

    async def broadcast(
        self,
        canvas_id: uuid.UUID,
        message: dict,
        *,
        exclude: uuid.UUID | None = None,
    ) -> None:
        room = self._rooms.get(canvas_id)
        if room is None:
            return
        async with room.lock:
            targets = [
                conn
                for cid, conn in room.connections.items()
                if cid != exclude
            ]
        # send outside the lock; a dead socket is cleaned up by its own loop
        for conn in targets:
            try:
                await conn.websocket.send_json(message)
            except Exception:
                pass

    def presence(self, canvas_id: uuid.UUID) -> list[dict]:
        room = self._rooms.get(canvas_id)
        if room is None:
            return []
        by_user: dict[uuid.UUID, dict] = {}
        for conn in room.connections.values():
            by_user[conn.user_id] = {
                "user_id": str(conn.user_id),
                "display_name": conn.display_name,
            }
        return list(by_user.values())

    def has_user(self, canvas_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        room = self._rooms.get(canvas_id)
        if room is None:
            return False
        return any(c.user_id == user_id for c in room.connections.values())


room_manager = RoomManager()

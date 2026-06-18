import uuid
from dataclasses import dataclass
from typing import Callable, Coroutine

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import InvalidTokenError, decode_token
from app.models.canvas import Canvas
from app.models.user import User
from app.models.workspace import ROLE_ORDER, Workspace, WorkspaceMember, WorkspaceRole
from app.services.canvas import get_canvas
from app.services.user import get_user_by_id
from app.services.workspace import get_membership, get_workspace

# auto_error=False so we return a 401 with WWW-Authenticate instead of a 403
_bearer_scheme = HTTPBearer(auto_error=False)

_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise _credentials_exc

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
        user_id = uuid.UUID(payload["sub"])
    except (InvalidTokenError, ValueError):
        raise _credentials_exc

    user = await get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise _credentials_exc
    return user


@dataclass
class WorkspaceContext:
    workspace: Workspace
    member: WorkspaceMember
    user: User


def require_workspace_role(
    min_role: WorkspaceRole,
) -> Callable[..., Coroutine[None, None, WorkspaceContext]]:
    async def dependency(
        workspace_id: uuid.UUID,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> WorkspaceContext:
        workspace = await get_workspace(db, workspace_id)
        membership = (
            await get_membership(db, workspace_id, current_user.id)
            if workspace is not None
            else None
        )
        # 404 (not 403) for non-members so we don't leak workspace existence
        if workspace is None or membership is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )
        if ROLE_ORDER[membership.role] < ROLE_ORDER[min_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires '{min_role.value}' role or higher.",
            )
        return WorkspaceContext(
            workspace=workspace, member=membership, user=current_user
        )

    return dependency


@dataclass
class CanvasContext:
    canvas: Canvas
    member: WorkspaceMember
    user: User


def require_canvas_role(
    min_role: WorkspaceRole,
) -> Callable[..., Coroutine[None, None, CanvasContext]]:
    async def dependency(
        canvas_id: uuid.UUID,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> CanvasContext:
        canvas = await get_canvas(db, canvas_id)
        membership = (
            await get_membership(db, canvas.workspace_id, current_user.id)
            if canvas is not None
            else None
        )
        if canvas is None or membership is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Canvas not found.",
            )
        if ROLE_ORDER[membership.role] < ROLE_ORDER[min_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires '{min_role.value}' role or higher.",
            )
        return CanvasContext(
            canvas=canvas, member=membership, user=current_user
        )

    return dependency

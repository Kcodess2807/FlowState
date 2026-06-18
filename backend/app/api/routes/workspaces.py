from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    WorkspaceContext,
    get_current_user,
    require_workspace_role,
)
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import WorkspaceRole
from app.schemas.canvas import CanvasCreate, CanvasRead
from app.schemas.workspace import (
    MemberAddRequest,
    WorkspaceCreate,
    WorkspaceMemberRead,
    WorkspaceRead,
)
from app.services.canvas import create_canvas, list_canvases
from app.services.user import get_user_by_email
from app.services.workspace import (
    AlreadyMemberError,
    add_member,
    create_workspace,
    list_members,
    list_workspaces_for_user,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
async def create(
    payload: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_workspace(
        db, name=payload.name, owner_id=current_user.id
    )


@router.get("", response_model=list[WorkspaceRead])
async def list_mine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_workspaces_for_user(db, current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceRead)
async def get_one(
    ctx: WorkspaceContext = Depends(require_workspace_role(WorkspaceRole.viewer)),
):
    return ctx.workspace


@router.get("/{workspace_id}/members", response_model=list[WorkspaceMemberRead])
async def get_members(
    ctx: WorkspaceContext = Depends(require_workspace_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await list_members(db, ctx.workspace.id)


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_workspace_member(
    payload: MemberAddRequest,
    ctx: WorkspaceContext = Depends(require_workspace_role(WorkspaceRole.owner)),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_email(db, payload.email.strip().lower())
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user with that email.",
        )
    try:
        return await add_member(
            db,
            workspace_id=ctx.workspace.id,
            user_id=user.id,
            role=payload.role,
        )
    except AlreadyMemberError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this workspace.",
        )


@router.post(
    "/{workspace_id}/canvases",
    response_model=CanvasRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace_canvas(
    payload: CanvasCreate,
    ctx: WorkspaceContext = Depends(require_workspace_role(WorkspaceRole.editor)),
    db: AsyncSession = Depends(get_db),
):
    return await create_canvas(
        db,
        workspace_id=ctx.workspace.id,
        name=payload.name,
        created_by=ctx.user.id,
    )


@router.get("/{workspace_id}/canvases", response_model=list[CanvasRead])
async def list_workspace_canvases(
    ctx: WorkspaceContext = Depends(require_workspace_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await list_canvases(db, ctx.workspace.id)

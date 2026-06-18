from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CanvasContext, require_canvas_role
from app.core.database import get_db
from app.models.workspace import WorkspaceRole
from app.schemas.canvas import CanvasRead
from app.schemas.operation import OperationCreate, OperationRead
from app.schemas.snapshot import CanvasStateRead, SnapshotRead
from app.schemas.version import (
    CanvasVersionCreate,
    CanvasVersionRead,
    RestoreRequest,
    RestoreResult,
    StateDiff,
)
from app.services.operation import append_operation, list_operations
from app.services.snapshot import (
    create_snapshot,
    list_snapshots,
    reconstruct_state,
)
from app.services.version import (
    create_version,
    diff_versions,
    list_versions,
    restore_to_version,
)

router = APIRouter(prefix="/canvases", tags=["canvases"])


@router.get("/{canvas_id}", response_model=CanvasRead)
async def get_one(
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
):
    return ctx.canvas


@router.post(
    "/{canvas_id}/operations",
    response_model=OperationRead,
    status_code=status.HTTP_201_CREATED,
)
async def commit_operation(
    payload: OperationCreate,
    response: Response,
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.editor)),
    db: AsyncSession = Depends(get_db),
):
    operation, created = await append_operation(
        db,
        canvas_id=ctx.canvas.id,
        op_type=payload.type,
        payload=payload.payload,
        user_id=ctx.user.id,
        client_op_id=payload.client_op_id,
    )
    # deduped op -> 200 instead of 201
    if not created:
        response.status_code = status.HTTP_200_OK
    return operation


@router.get("/{canvas_id}/operations", response_model=list[OperationRead])
async def get_operations(
    since: int = Query(0, ge=0),
    limit: int | None = Query(None, ge=1, le=1000),
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await list_operations(
        db, ctx.canvas.id, since_version=since, limit=limit
    )


@router.get("/{canvas_id}/state", response_model=CanvasStateRead)
async def get_state(
    at: int | None = Query(None, ge=0),
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    shapes, version = await reconstruct_state(db, ctx.canvas.id, at_version=at)
    return CanvasStateRead(
        canvas_id=ctx.canvas.id, version=version, shapes=shapes
    )


@router.post(
    "/{canvas_id}/snapshots",
    response_model=SnapshotRead,
    status_code=status.HTTP_201_CREATED,
)
async def make_snapshot(
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.editor)),
    db: AsyncSession = Depends(get_db),
):
    return await create_snapshot(db, ctx.canvas.id)


@router.get("/{canvas_id}/snapshots", response_model=list[SnapshotRead])
async def get_snapshots(
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await list_snapshots(db, ctx.canvas.id)


@router.post(
    "/{canvas_id}/versions",
    response_model=CanvasVersionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_canvas_version(
    payload: CanvasVersionCreate,
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.editor)),
    db: AsyncSession = Depends(get_db),
):
    return await create_version(
        db, canvas_id=ctx.canvas.id, label=payload.label, created_by=ctx.user.id
    )


@router.get("/{canvas_id}/versions", response_model=list[CanvasVersionRead])
async def get_versions(
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await list_versions(db, ctx.canvas.id)


@router.get("/{canvas_id}/diff", response_model=StateDiff)
async def get_diff(
    from_version: int = Query(0, ge=0, alias="from"),
    to_version: int | None = Query(None, ge=0, alias="to"),
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.viewer)),
    db: AsyncSession = Depends(get_db),
):
    return await diff_versions(
        db, ctx.canvas.id, from_version=from_version, to_version=to_version
    )


@router.post("/{canvas_id}/restore", response_model=RestoreResult)
async def restore_canvas(
    payload: RestoreRequest,
    ctx: CanvasContext = Depends(require_canvas_role(WorkspaceRole.editor)),
    db: AsyncSession = Depends(get_db),
):
    new_version, ops = await restore_to_version(
        db,
        ctx.canvas.id,
        target_version=payload.target_version,
        user_id=ctx.user.id,
    )
    return RestoreResult(
        canvas_id=ctx.canvas.id, version=new_version, operations_applied=ops
    )

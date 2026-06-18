import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole


class AlreadyMemberError(Exception):
    pass


async def create_workspace(
    db: AsyncSession, *, name: str, owner_id: uuid.UUID
) -> Workspace:
    workspace = Workspace(name=name.strip(), owner_id=owner_id)
    db.add(workspace)
    await db.flush()

    # creator is always an owner member, so all access checks go through membership
    db.add(
        WorkspaceMember(
            workspace_id=workspace.id,
            user_id=owner_id,
            role=WorkspaceRole.owner,
        )
    )
    await db.flush()
    await db.refresh(workspace)
    return workspace


async def get_workspace(
    db: AsyncSession, workspace_id: uuid.UUID
) -> Workspace | None:
    return await db.get(Workspace, workspace_id)


async def list_workspaces_for_user(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Workspace]:
    stmt = (
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
        .order_by(Workspace.created_at)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_membership(
    db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID
) -> WorkspaceMember | None:
    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_members(
    db: AsyncSession, workspace_id: uuid.UUID
) -> list[WorkspaceMember]:
    stmt = (
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.created_at)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def add_member(
    db: AsyncSession,
    *,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    role: WorkspaceRole,
) -> WorkspaceMember:
    if await get_membership(db, workspace_id, user_id) is not None:
        raise AlreadyMemberError(str(user_id))

    member = WorkspaceMember(
        workspace_id=workspace_id, user_id=user_id, role=role
    )
    db.add(member)
    await db.flush()
    await db.refresh(member)
    return member

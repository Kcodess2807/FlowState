"""add undo_of to operations

Revision ID: 0006
Revises: 0005
Create Date: 2026-06-18 17:55:57.153615

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0006'
down_revision: str | None = '0005'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('operations', sa.Column('undo_of', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_operations_undo_of', 'operations', 'operations',
        ['undo_of'], ['id'], ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_operations_undo_of', 'operations', type_='foreignkey')
    op.drop_column('operations', 'undo_of')

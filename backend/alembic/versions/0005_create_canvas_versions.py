"""create canvas_versions table

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-18 08:40:24.875968

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0005'
down_revision: str | None = '0004'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('canvas_versions',
    sa.Column('canvas_id', sa.UUID(), nullable=False),
    sa.Column('version', sa.BigInteger(), nullable=False),
    sa.Column('label', sa.String(length=120), nullable=False),
    sa.Column('created_by', sa.UUID(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['canvas_id'], ['canvases.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_canvas_versions_canvas_id'), 'canvas_versions', ['canvas_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_canvas_versions_canvas_id'), table_name='canvas_versions')
    op.drop_table('canvas_versions')

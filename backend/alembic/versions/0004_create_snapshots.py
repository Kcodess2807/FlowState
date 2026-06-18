"""create snapshots table

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-18 07:00:30.026291

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0004'
down_revision: str | None = '0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('snapshots',
    sa.Column('canvas_id', sa.UUID(), nullable=False),
    sa.Column('version', sa.BigInteger(), nullable=False),
    sa.Column('state', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['canvas_id'], ['canvases.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('canvas_id', 'version', name='uq_snapshot_canvas_version')
    )
    op.create_index(op.f('ix_snapshots_canvas_id'), 'snapshots', ['canvas_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_snapshots_canvas_id'), table_name='snapshots')
    op.drop_table('snapshots')

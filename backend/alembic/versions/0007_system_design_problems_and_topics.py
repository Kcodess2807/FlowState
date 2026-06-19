"""system design problems and topics

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-19 08:16:20.626381

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0007'
down_revision: str | None = '0006'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('problems',
    sa.Column('slug', sa.String(length=120), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('difficulty', sa.Enum('easy', 'medium', 'hard', name='difficulty'), nullable=False),
    sa.Column('rubric', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('reference_solution', sa.Text(), nullable=True),
    sa.Column('is_published', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_problems_difficulty'), 'problems', ['difficulty'], unique=False)
    op.create_index(op.f('ix_problems_is_published'), 'problems', ['is_published'], unique=False)
    op.create_index(op.f('ix_problems_slug'), 'problems', ['slug'], unique=True)
    op.create_table('topics',
    sa.Column('slug', sa.String(length=80), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_topics_slug'), 'topics', ['slug'], unique=True)
    op.create_table('problem_topics',
    sa.Column('problem_id', sa.UUID(), nullable=False),
    sa.Column('topic_id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['problem_id'], ['problems.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('problem_id', 'topic_id')
    )
    op.add_column('users', sa.Column('is_staff', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'is_staff')
    op.drop_table('problem_topics')
    op.drop_index(op.f('ix_topics_slug'), table_name='topics')
    op.drop_table('topics')
    op.drop_index(op.f('ix_problems_slug'), table_name='problems')
    op.drop_index(op.f('ix_problems_is_published'), table_name='problems')
    op.drop_index(op.f('ix_problems_difficulty'), table_name='problems')
    op.drop_table('problems')
    # drop the enum type Postgres leaves behind after the table is gone
    sa.Enum(name='difficulty').drop(op.get_bind(), checkfirst=True)

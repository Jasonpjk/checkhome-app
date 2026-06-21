"""add storage_locations table

Revision ID: 003
Revises: 002
Create Date: 2026-06-21

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'storage_locations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('family_id', sa.Integer(), sa.ForeignKey('families.id'), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_location_name'),
    )
    op.create_index('ix_storage_locations_id', 'storage_locations', ['id'])


def downgrade() -> None:
    op.drop_index('ix_storage_locations_id', table_name='storage_locations')
    op.drop_table('storage_locations')

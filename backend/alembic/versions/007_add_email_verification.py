"""add email verification columns to users

Revision ID: 007
Revises: 006
Create Date: 2026-06-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('users', sa.Column('verification_code', sa.String(), nullable=True))
    op.add_column('users', sa.Column('verification_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('verification_attempts', sa.Integer(), server_default='0', nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'verification_attempts')
    op.drop_column('users', 'verification_expires_at')
    op.drop_column('users', 'verification_code')
    op.drop_column('users', 'email_verified')

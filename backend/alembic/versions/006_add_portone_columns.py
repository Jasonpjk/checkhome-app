"""add portone columns

Revision ID: 006
Revises: 005
Create Date: 2026-06-21

"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('subscriptions', sa.Column('billing_key', sa.String(), nullable=True))
    op.add_column('subscriptions', sa.Column('portone_payment_id', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('subscriptions', 'portone_payment_id')
    op.drop_column('subscriptions', 'billing_key')

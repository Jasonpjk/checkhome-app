"""backfill email_verified=true for existing users (grandfather pre-verification accounts)

기존(이메일 인증 도입 전) 가입자는 모두 인증된 것으로 처리해, 인증 도입 후 로그인이 막히지 않게 한다.
이 백필 시점 이후 새로 가입하는 사용자만 이메일 인증을 거친다(컬럼 server_default=false).

Revision ID: 008
Revises: 007
Create Date: 2026-06-23

"""
from typing import Sequence, Union

from alembic import op

revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 기존 사용자 grandfather 처리 (이 마이그레이션 적용 시점에 존재하는 모든 미인증 계정을 인증 처리)
    op.execute("UPDATE users SET email_verified = true WHERE email_verified = false")


def downgrade() -> None:
    # 백필은 되돌리지 않는다 (데이터 복원 불가)
    pass

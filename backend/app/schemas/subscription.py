from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    has_billing_key: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, sub):
        return cls(
            plan=sub.plan,
            status=sub.status,
            current_period_end=sub.current_period_end,
            cancel_at_period_end=sub.cancel_at_period_end,
            has_billing_key=bool(sub.billing_key),
        )


class SubscribeRequest(BaseModel):
    billing_key: str
    plan: str  # starter | pro | premium


class CancelResponse(BaseModel):
    success: bool
    message: str


PLANS = {
    "free": {"name": "무료", "price": 0, "description": "기본 기능 무제한"},
    "starter": {"name": "스타터", "price": 4900, "description": "사진 첨부·위치 관리"},
    "pro": {"name": "프로", "price": 9900, "description": "가족 공유·AI 인식 강화"},
    "premium": {"name": "프리미엄", "price": 19900, "description": "알림·무제한 가족·프리미엄 지원"},
}

PLAN_PRICES = {k: v["price"] for k, v in PLANS.items()}

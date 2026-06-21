from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    stripe_subscription_id: Optional[str] = None

    class Config:
        from_attributes = True


class CreateCheckoutRequest(BaseModel):
    plan: str  # starter | pro | premium
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class PortalRequest(BaseModel):
    return_url: str


class PortalResponse(BaseModel):
    portal_url: str


PLANS = {
    "free": {"name": "무료", "price": 0, "description": "기본 기능 무제한"},
    "starter": {"name": "스타터", "price": 4900, "description": "사진 첨부·위치 관리"},
    "pro": {"name": "프로", "price": 9900, "description": "가족 공유·AI 인식 강화"},
    "premium": {"name": "프리미엄", "price": 19900, "description": "알림·무제한 가족·프리미엄 지원"},
}

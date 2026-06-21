import hmac
import hashlib
import base64
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import httpx
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.subscription import (
    SubscriptionResponse, SubscribeRequest, CancelResponse, PLANS, PLAN_PRICES
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PORTONE_API_BASE = "https://api.portone.io"


def _portone_headers():
    return {"Authorization": f"PortOne {settings.PORTONE_API_SECRET}"}


def _get_or_create_subscription(user: User, db: Session) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        sub = Subscription(user_id=user.id, plan="free", status="active")
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@router.get("/me")
def get_my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = _get_or_create_subscription(current_user, db)
    return SubscriptionResponse.from_orm_model(sub)


@router.get("/plans")
def get_plans():
    return PLANS


@router.post("/subscribe")
async def subscribe(
    req: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.PORTONE_API_SECRET:
        raise HTTPException(status_code=503, detail="결제 기능이 아직 준비 중입니다")

    price = PLAN_PRICES.get(req.plan)
    if not price:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다")

    sub = _get_or_create_subscription(current_user, db)
    payment_id = f"checkhome-{uuid.uuid4().hex}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PORTONE_API_BASE}/payments/{payment_id}/billing-key",
            headers=_portone_headers(),
            json={
                "billingKey": req.billing_key,
                "orderName": f"체크홈 {PLANS[req.plan]['name']} 플랜",
                "customer": {
                    "customerId": str(current_user.id),
                    "fullName": current_user.name,
                    "email": current_user.email,
                },
                "amount": {"total": price},
                "currency": "KRW",
            },
            timeout=30,
        )

    data = resp.json()
    if resp.status_code != 200 or data.get("status") not in ("PAID",):
        raise HTTPException(status_code=400, detail=data.get("message", "결제에 실패했습니다"))

    now = datetime.now(timezone.utc)
    next_period = now + timedelta(days=30)

    sub.billing_key = req.billing_key
    sub.portone_payment_id = payment_id
    sub.plan = req.plan
    sub.status = "active"
    sub.current_period_start = now
    sub.current_period_end = next_period
    sub.cancel_at_period_end = False
    db.commit()

    # 다음 달 자동 결제 예약
    next_payment_id = f"checkhome-{uuid.uuid4().hex}"
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{PORTONE_API_BASE}/schedules",
            headers=_portone_headers(),
            json={
                "payment": {
                    "billingKey": req.billing_key,
                    "orderName": f"체크홈 {PLANS[req.plan]['name']} 플랜",
                    "customer": {
                        "customerId": str(current_user.id),
                        "fullName": current_user.name,
                        "email": current_user.email,
                    },
                    "amount": {"total": price},
                    "currency": "KRW",
                },
                "timeToPay": next_period.strftime("%Y-%m-%dT%H:%M:%S+00:00"),
                "paymentId": next_payment_id,
            },
            timeout=30,
        )

    return {"success": True}


@router.post("/cancel", response_model=CancelResponse)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub or sub.plan == "free":
        raise HTTPException(status_code=400, detail="취소할 구독이 없습니다")

    sub.cancel_at_period_end = True
    db.commit()

    period_end = sub.current_period_end
    msg = f"{period_end.strftime('%Y년 %m월 %d일')}까지 이용 가능합니다" if period_end else "기간 말에 해지됩니다"
    return CancelResponse(success=True, message=msg)


@router.post("/webhook")
async def portone_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8")

    if settings.PORTONE_WEBHOOK_SECRET:
        webhook_id = request.headers.get("webhook-id", "")
        webhook_ts = request.headers.get("webhook-timestamp", "")
        webhook_sig = request.headers.get("webhook-signature", "")

        sign_input = f"{webhook_id}.{webhook_ts}.{body_str}".encode()
        secret_bytes = base64.b64decode(settings.PORTONE_WEBHOOK_SECRET)
        expected = base64.b64encode(hmac.new(secret_bytes, sign_input, hashlib.sha256).digest()).decode()
        valid = any(
            hmac.compare_digest(expected, sig.split(",", 1)[-1])
            for sig in webhook_sig.split(" ")
        )
        if not valid:
            raise HTTPException(status_code=400, detail="웹훅 서명 검증 실패")

    import json
    try:
        event = json.loads(body_str)
    except Exception:
        raise HTTPException(status_code=400, detail="잘못된 웹훅 형식")

    event_type = event.get("type", "")
    data = event.get("data", {})

    if event_type == "Transaction.Paid":
        payment_id = data.get("paymentId", "")
        customer_id = data.get("customer", {}).get("customerId", "")
        if customer_id:
            sub = db.query(Subscription).filter(
                Subscription.user_id == int(customer_id)
            ).first()
            if sub and sub.status == "active":
                now = datetime.now(timezone.utc)
                sub.portone_payment_id = payment_id
                sub.current_period_start = now
                sub.current_period_end = now + timedelta(days=30)
                db.commit()

    elif event_type == "Transaction.Failed":
        customer_id = data.get("customer", {}).get("customerId", "")
        if customer_id:
            sub = db.query(Subscription).filter(
                Subscription.user_id == int(customer_id)
            ).first()
            if sub:
                sub.status = "past_due"
                db.commit()

    elif event_type == "BillingKey.Deleted":
        billing_key = data.get("billingKey", "")
        if billing_key:
            sub = db.query(Subscription).filter(Subscription.billing_key == billing_key).first()
            if sub:
                sub.billing_key = None
                sub.plan = "free"
                sub.status = "expired"
                db.commit()

    return {"ok": True}

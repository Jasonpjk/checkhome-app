from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.subscription import (
    SubscriptionResponse, CreateCheckoutRequest, CheckoutResponse,
    PortalRequest, PortalResponse, PLANS
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PLAN_TO_PRICE = {
    "starter": settings.STRIPE_PRICE_STARTER,
    "pro": settings.STRIPE_PRICE_PRO,
    "premium": settings.STRIPE_PRICE_PREMIUM,
}


def _get_or_create_subscription(user: User, db: Session) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        sub = Subscription(user_id=user.id, plan="free", status="active")
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = _get_or_create_subscription(current_user, db)
    return sub


@router.get("/plans")
def get_plans():
    return PLANS


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    req: CreateCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="결제 기능이 아직 준비 중입니다")

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
    except ImportError:
        raise HTTPException(status_code=503, detail="결제 모듈이 설치되지 않았습니다")

    price_id = PLAN_TO_PRICE.get(req.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다")

    sub = _get_or_create_subscription(current_user, db)

    if not sub.stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=current_user.name,
            metadata={"user_id": str(current_user.id)},
        )
        sub.stripe_customer_id = customer.id
        db.commit()

    session = stripe.checkout.Session.create(
        customer=sub.stripe_customer_id,
        payment_method_types=["card"],
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=req.success_url,
        cancel_url=req.cancel_url,
        metadata={"user_id": str(current_user.id), "plan": req.plan},
    )
    return CheckoutResponse(checkout_url=session.url)


@router.post("/portal", response_model=PortalResponse)
def create_portal(
    req: PortalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="결제 기능이 아직 준비 중입니다")

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
    except ImportError:
        raise HTTPException(status_code=503, detail="결제 모듈이 설치되지 않았습니다")

    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub or not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="구독 정보가 없습니다")

    portal = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=req.return_url,
    )
    return PortalResponse(portal_url=portal.url)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="웹훅이 설정되지 않았습니다")

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
    except ImportError:
        raise HTTPException(status_code=503, detail="결제 모듈이 설치되지 않았습니다")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="웹훅 서명 검증 실패")

    data = event["data"]["object"]

    if event["type"] == "checkout.session.completed":
        user_id = int(data.get("metadata", {}).get("user_id", 0))
        plan = data.get("metadata", {}).get("plan", "free")
        stripe_sub_id = data.get("subscription")
        if user_id:
            sub = db.query(Subscription).filter(Subscription.user_id == user_id).first()
            if sub:
                sub.plan = plan
                sub.status = "active"
                sub.stripe_subscription_id = stripe_sub_id
                db.commit()

    elif event["type"] in ("customer.subscription.updated", "customer.subscription.deleted"):
        stripe_sub_id = data.get("id")
        sub = db.query(Subscription).filter(Subscription.stripe_subscription_id == stripe_sub_id).first()
        if sub:
            stripe_status = data.get("status")
            sub.status = "active" if stripe_status in ("active", "trialing") else "expired"
            sub.cancel_at_period_end = data.get("cancel_at_period_end", False)
            if event["type"] == "customer.subscription.deleted":
                sub.plan = "free"
                sub.status = "expired"
            db.commit()

    return {"ok": True}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.item import Item
from app.models.vehicle import Vehicle
from app.models.family import Family, FamilyMember

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자 권한이 필요합니다")
    return current_user


@router.get("/me")
def get_admin_me(admin: User = Depends(require_admin)):
    return {"id": admin.id, "email": admin.email, "name": admin.name, "is_admin": admin.is_admin}


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_members = db.query(User).filter(User.is_admin == False).count()
    total_families = db.query(Family).count()
    total_items = db.query(Item).filter(Item.is_active == True).count()

    all_items = db.query(Item).filter(Item.is_active == True).all()
    from app.api.items import _item_to_response
    item_dicts = [_item_to_response(i) for i in all_items]

    action_needed = len([r for r in item_dicts if r["status"] in ("expired", "imminent", "check-needed")])
    this_week = len([r for r in item_dicts if r["days_left"] is not None and 0 <= r["days_left"] <= 7])
    urgent_items = sorted(
        [r for r in item_dicts if r["status"] in ("expired", "imminent", "check-needed")],
        key=lambda x: {"expired": 0, "imminent": 1, "check-needed": 2}.get(x["status"], 3)
    )[:6]

    category_counts = {}
    for item in item_dicts:
        cat = item.get("category", "기타")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    status_counts = {}
    for item in item_dicts:
        s = item.get("status", "normal")
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "total_members": total_members,
        "total_families": total_families,
        "total_items": total_items,
        "action_needed": action_needed,
        "this_week": this_week,
        "urgent_items": urgent_items,
        "category_counts": category_counts,
        "status_counts": status_counts,
    }


@router.get("/members")
def get_all_members(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).filter(User.is_admin == False).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        item_count = db.query(Item).filter(Item.user_id == u.id, Item.is_active == True).count()
        vehicle_count = db.query(Vehicle).filter(Vehicle.user_id == u.id).count()
        membership = db.query(FamilyMember).filter(FamilyMember.user_id == u.id).first()
        family_name = ""
        if membership:
            family = db.query(Family).filter(Family.id == membership.family_id).first()
            family_name = family.name if family else ""
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "item_count": item_count,
            "vehicle_count": vehicle_count,
            "family_group": family_name,
            "role": membership.role if membership else "none",
            "created_at": u.created_at,
            "status": "정상",
            "subscription_status": "무료",
            "notification_enabled": True,
        })
    return result


@router.get("/items")
def get_all_items(
    category: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from app.api.items import _item_to_response
    query = db.query(Item).filter(Item.is_active == True)
    if category and category != "전체":
        query = query.filter(Item.category == category)
    items = query.order_by(Item.created_at.desc()).all()
    result = [_item_to_response(i) for i in items]
    if status and status != "전체":
        result = [r for r in result if r["status"] == status]
    for r in result:
        user = db.query(User).filter(User.id == r.get("user_id", 0)).first()
        r["owner_name"] = user.name if user else "-"
    return result


@router.get("/vehicles")
def get_all_vehicles(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from app.models.vehicle import VehicleCheck
    vehicles = db.query(Vehicle).order_by(Vehicle.created_at.desc()).all()
    result = []
    for v in vehicles:
        checks = db.query(VehicleCheck).filter(VehicleCheck.vehicle_id == v.id).all()
        user = db.query(User).filter(User.id == v.user_id).first()
        result.append({
            "id": v.id,
            "name": v.name,
            "plate": v.plate,
            "mileage": v.mileage,
            "owner_name": user.name if user else "-",
            "created_at": v.created_at,
            "checks": [
                {
                    "id": c.id,
                    "check_type": c.check_type,
                    "last_check_date": c.last_check_date,
                    "next_check_date": c.next_check_date,
                    "memo": c.memo,
                }
                for c in checks
            ],
        })
    return result


@router.put("/members/{user_id}/status")
def update_member_status(
    user_id: int,
    body: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다")
    return {"ok": True, "message": f"상태가 변경되었습니다"}


@router.post("/members/{user_id}/make-admin")
def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다")
    user.is_admin = True
    db.commit()
    return {"ok": True}

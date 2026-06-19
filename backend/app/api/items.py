from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.item import Item, ActionLog
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse, ActionRequest

router = APIRouter(prefix="/items", tags=["items"])


def _item_to_response(item: Item) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "location": item.location,
        "expiry_date": item.expiry_date,
        "open_date": item.open_date,
        "pao_days": item.pao_days,
        "photo_url": item.photo_url,
        "handler_name": item.handler_name,
        "is_family_shared": item.is_family_shared,
        "quantity": item.quantity,
        "memo": item.memo,
        "risk": item.risk,
        "status": item.status,
        "days_left": item.days_left,
        "created_at": item.created_at,
    }


@router.get("", response_model=List[ItemResponse])
def list_items(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Item).filter(Item.user_id == current_user.id, Item.is_active == True)
    if category and category != "전체":
        query = query.filter(Item.category == category)
    items = query.all()
    result = [_item_to_response(item) for item in items]
    if status and status != "전체":
        result = [r for r in result if r["status"] == status]
    return result


@router.post("", response_model=ItemResponse)
def create_item(
    req: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = Item(user_id=current_user.id, **req.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return _item_to_response(item)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = db.query(Item).filter(Item.user_id == current_user.id, Item.is_active == True).all()
    results = [_item_to_response(item) for item in items]
    action_needed = [r for r in results if r["status"] in ("expired", "imminent", "check-needed")]
    this_week = [r for r in results if r["days_left"] is not None and 0 <= r["days_left"] <= 7]
    urgent = sorted(action_needed, key=lambda x: (
        {"expired": 0, "imminent": 1, "check-needed": 2}.get(x["status"], 3)
    ))[:4]
    return {
        "total": len(results),
        "action_needed": len(action_needed),
        "this_week": len(this_week),
        "urgent_items": urgent,
    }


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다")
    return _item_to_response(item)


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    req: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return _item_to_response(item)


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다")
    item.is_active = False
    db.commit()
    return {"ok": True}


@router.post("/{item_id}/action")
def record_action(
    item_id: int,
    req: ActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다")
    log = ActionLog(item_id=item_id, user_id=current_user.id, action_type=req.action_type, note=req.note)
    db.add(log)
    if req.action_type in ("completed", "disposed", "replaced"):
        item.is_active = False
    db.commit()
    return {"ok": True}

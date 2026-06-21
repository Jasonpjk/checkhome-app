from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.family import FamilyMember
from app.models.location import StorageLocation
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter(prefix="/locations", tags=["locations"])

DEFAULT_LOCATIONS = ["냉장고", "냉동실", "주방 수납장", "욕실", "창고", "차량"]


def _family_id(db: Session, user_id: int):
    m = db.query(FamilyMember).filter(FamilyMember.user_id == user_id).first()
    return m.family_id if m else None


def _visible_filter(current_user: User, fam_id):
    """가족에 속하면 가족 공통 위치 + 내 개인 위치, 아니면 내 위치만."""
    if fam_id is not None:
        return or_(
            StorageLocation.family_id == fam_id,
            and_(StorageLocation.user_id == current_user.id, StorageLocation.family_id.is_(None)),
        )
    return StorageLocation.user_id == current_user.id


def _query(db: Session, current_user: User):
    fam_id = _family_id(db, current_user.id)
    return db.query(StorageLocation).filter(_visible_filter(current_user, fam_id)).order_by(
        StorageLocation.sort_order, StorageLocation.id
    )


@router.get("", response_model=List[LocationResponse])
def list_locations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = _query(db, current_user).all()
    if not rows:
        # 최초 1회 기본 위치 시드 (가족이면 가족 공통으로)
        fam_id = _family_id(db, current_user.id)
        for i, n in enumerate(DEFAULT_LOCATIONS):
            db.add(StorageLocation(user_id=current_user.id, family_id=fam_id, name=n, sort_order=i))
        db.commit()
        rows = _query(db, current_user).all()
    return rows


@router.post("", response_model=LocationResponse)
def create_location(req: LocationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="위치 이름을 입력하세요")
    fam_id = _family_id(db, current_user.id)
    exists = _query(db, current_user).filter(StorageLocation.name == name).first()
    if exists:
        raise HTTPException(status_code=409, detail="이미 있는 위치입니다")
    max_order = db.query(StorageLocation).filter(_visible_filter(current_user, fam_id)).count()
    loc = StorageLocation(user_id=current_user.id, family_id=fam_id, name=name, sort_order=max_order)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.put("/{loc_id}", response_model=LocationResponse)
def update_location(loc_id: int, req: LocationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loc = _query(db, current_user).filter(StorageLocation.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="위치를 찾을 수 없습니다")
    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(loc, k, v)
    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/{loc_id}")
def delete_location(loc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loc = _query(db, current_user).filter(StorageLocation.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="위치를 찾을 수 없습니다")
    # 주의: 기존 항목의 location 문자열은 보존(연쇄 삭제 안 함)
    db.delete(loc)
    db.commit()
    return {"ok": True}

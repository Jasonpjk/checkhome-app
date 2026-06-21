import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.family import Family, FamilyMember, MemberRole
from app.models.item import Item
from app.schemas.family import FamilyCreate, FamilyResponse, JoinFamilyRequest

router = APIRouter(prefix="/families", tags=["families"])


def _count_personal_items(db: Session, user_id: int) -> int:
    """아직 가족에 공유되지 않은(family_id NULL) 내 항목 수."""
    return db.query(Item).filter(
        Item.user_id == user_id,
        Item.family_id.is_(None),
        Item.is_active == True,
    ).count()


def _family_to_response(family: Family, personal_item_count: int | None = None) -> dict:
    return {
        "id": family.id,
        "name": family.name,
        "invite_code": family.invite_code,
        "created_at": family.created_at,
        "personal_item_count": personal_item_count,
        "members": [
            {
                "id": m.id,
                "user_id": m.user_id,
                "role": m.role,
                "name": m.user.name,
                "email": m.user.email,
                "joined_at": m.joined_at,
            }
            for m in family.members
        ],
    }


@router.post("", response_model=FamilyResponse)
def create_family(
    req: FamilyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 가족 그룹에 속해 있습니다")
    personal_count = _count_personal_items(db, current_user.id)
    family = Family(name=req.name, invite_code=secrets.token_urlsafe(8))
    db.add(family)
    db.flush()
    member = FamilyMember(family_id=family.id, user_id=current_user.id, role=MemberRole.owner)
    db.add(member)
    db.commit()
    db.refresh(family)
    return _family_to_response(family, personal_item_count=personal_count)


@router.get("/me", response_model=FamilyResponse)
def get_my_family(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="가족 그룹이 없습니다")
    return _family_to_response(membership.family)


@router.post("/join", response_model=FamilyResponse)
def join_family(
    req: JoinFamilyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 가족 그룹에 속해 있습니다")
    family = db.query(Family).filter(Family.invite_code == req.invite_code).first()
    if not family:
        raise HTTPException(status_code=404, detail="초대 코드가 올바르지 않습니다")
    personal_count = _count_personal_items(db, current_user.id)
    member = FamilyMember(family_id=family.id, user_id=current_user.id, role=MemberRole.editor)
    db.add(member)
    db.commit()
    db.refresh(family)
    return _family_to_response(family, personal_item_count=personal_count)


@router.post("/me/share-existing")
def share_existing_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """가족 참여 전에 만들어둔 내 개인 항목들을 가족과 공유 상태로 전환."""
    membership = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="가족 그룹이 없습니다")
    updated = db.query(Item).filter(
        Item.user_id == current_user.id,
        Item.family_id.is_(None),
        Item.is_active == True,
    ).update(
        {Item.family_id: membership.family_id, Item.is_family_shared: True},
        synchronize_session=False,
    )
    db.commit()
    return {"ok": True, "shared_count": updated}

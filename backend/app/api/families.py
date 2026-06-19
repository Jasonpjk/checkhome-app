import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.family import Family, FamilyMember, MemberRole
from app.schemas.family import FamilyCreate, FamilyResponse, JoinFamilyRequest

router = APIRouter(prefix="/families", tags=["families"])


def _family_to_response(family: Family) -> dict:
    return {
        "id": family.id,
        "name": family.name,
        "invite_code": family.invite_code,
        "created_at": family.created_at,
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
    family = Family(name=req.name, invite_code=secrets.token_urlsafe(8))
    db.add(family)
    db.flush()
    member = FamilyMember(family_id=family.id, user_id=current_user.id, role=MemberRole.owner)
    db.add(member)
    db.commit()
    db.refresh(family)
    return _family_to_response(family)


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
    member = FamilyMember(family_id=family.id, user_id=current_user.id, role=MemberRole.editor)
    db.add(member)
    db.commit()
    db.refresh(family)
    return _family_to_response(family)

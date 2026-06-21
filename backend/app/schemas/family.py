from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class FamilyCreate(BaseModel):
    name: str


class FamilyMemberResponse(BaseModel):
    id: int
    user_id: int
    role: str
    name: str
    email: str
    joined_at: datetime

    class Config:
        from_attributes = True


class FamilyResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    created_at: datetime
    members: List[FamilyMemberResponse] = []
    # 가족 참여/생성 직전, 본인이 만들어둔 '아직 가족에 공유되지 않은' 개인 항목 수.
    # 0보다 크면 프론트에서 "기존 N개를 가족과 공유할까요?"를 물어본다.
    personal_item_count: Optional[int] = None

    class Config:
        from_attributes = True


class JoinFamilyRequest(BaseModel):
    invite_code: str

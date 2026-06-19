from pydantic import BaseModel
from datetime import datetime
from typing import List


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

    class Config:
        from_attributes = True


class JoinFamilyRequest(BaseModel):
    invite_code: str

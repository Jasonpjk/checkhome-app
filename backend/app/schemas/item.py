from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class ItemCreate(BaseModel):
    name: str
    category: str
    location: Optional[str] = None
    expiry_date: Optional[date] = None
    open_date: Optional[date] = None
    pao_days: Optional[int] = None
    handler_name: Optional[str] = None
    is_family_shared: bool = False
    quantity: int = 1
    memo: Optional[str] = None
    risk: str = "medium"


class ItemUpdate(ItemCreate):
    name: Optional[str] = None
    category: Optional[str] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    category: str
    location: Optional[str]
    expiry_date: Optional[date]
    open_date: Optional[date]
    pao_days: Optional[int]
    photo_url: Optional[str]
    handler_name: Optional[str]
    is_family_shared: bool
    quantity: int
    memo: Optional[str]
    risk: str
    status: str
    days_left: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ActionRequest(BaseModel):
    action_type: str
    note: Optional[str] = None

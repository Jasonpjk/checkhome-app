from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LocationCreate(BaseModel):
    name: str


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None


class LocationResponse(BaseModel):
    id: int
    name: str
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True

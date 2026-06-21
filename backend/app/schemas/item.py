from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional, List

# data URL 문자열 안전 상한 (약 5MB 디코딩 분량). 정상 사진은 프론트 자동 압축으로 훨씬 작음.
MAX_PHOTO_CHARS = 7_000_000


class ItemCreate(BaseModel):
    name: str
    category: str
    location: Optional[str] = None
    expiry_date: Optional[date] = None
    open_date: Optional[date] = None
    pao_days: Optional[int] = None
    photo_url: Optional[str] = None
    handler_name: Optional[str] = None
    is_family_shared: bool = False
    quantity: int = 1
    memo: Optional[str] = None
    risk: str = "medium"

    @field_validator("photo_url")
    @classmethod
    def _limit_photo_size(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > MAX_PHOTO_CHARS:
            raise ValueError("이미지가 너무 큽니다 (최대 약 5MB)")
        return v


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
    family_id: Optional[int] = None
    created_by_name: Optional[str] = None  # 등록한 사람 이름 (가족 공유 시 누가 등록했는지 표시)
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


class PhotoAnalyzeRequest(BaseModel):
    # 단일 이미지 (하위 호환)
    image: Optional[str] = None
    # 복수 이미지 (앞면 + 뒷면 등 최대 2장)
    images: Optional[List[str]] = None


class PhotoAnalyzeResponse(BaseModel):
    name: str
    category: str
    expiry_date: str
    memo: str
    confidence: str

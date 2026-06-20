from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class VehicleCreate(BaseModel):
    name: str
    plate: str
    mileage: int = 0


class VehicleCheckCreate(BaseModel):
    check_type: str
    last_check_date: Optional[date] = None
    next_check_date: Optional[date] = None
    last_mileage: Optional[int] = None
    interval_mileage: Optional[int] = None
    memo: Optional[str] = None


class VehicleCheckUpdate(BaseModel):
    check_type: Optional[str] = None
    last_check_date: Optional[date] = None
    next_check_date: Optional[date] = None
    last_mileage: Optional[int] = None
    interval_mileage: Optional[int] = None
    memo: Optional[str] = None


class VehicleCheckResponse(BaseModel):
    id: int
    vehicle_id: int
    check_type: str
    last_check_date: Optional[date]
    next_check_date: Optional[date]
    last_mileage: Optional[int]
    interval_mileage: Optional[int]
    memo: Optional[str]
    days_left: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class VehicleResponse(BaseModel):
    id: int
    name: str
    plate: str
    mileage: int
    created_at: datetime
    checks: List[VehicleCheckResponse] = []

    class Config:
        from_attributes = True

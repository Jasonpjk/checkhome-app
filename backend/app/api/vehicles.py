from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleCheck
from app.schemas.vehicle import VehicleCreate, VehicleCheckCreate, VehicleResponse, VehicleCheckResponse

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

DEFAULT_CHECKS = [
    "자동차 보험", "정기검사", "엔진오일", "타이어 공기압", "타이어 위치교환",
    "와이퍼", "에어컨 필터", "브레이크액", "냉각수", "배터리",
    "블랙박스 SD카드", "차량 소화기", "하이패스 카드",
]


def _vehicle_to_response(vehicle: Vehicle) -> dict:
    return {
        "id": vehicle.id,
        "name": vehicle.name,
        "plate": vehicle.plate,
        "mileage": vehicle.mileage,
        "created_at": vehicle.created_at,
        "checks": [
            {
                "id": c.id,
                "vehicle_id": c.vehicle_id,
                "check_type": c.check_type,
                "last_check_date": c.last_check_date,
                "next_check_date": c.next_check_date,
                "last_mileage": c.last_mileage,
                "interval_mileage": c.interval_mileage,
                "memo": c.memo,
                "days_left": c.days_left,
                "created_at": c.created_at,
            }
            for c in vehicle.checks
        ],
    }


@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicles = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()
    return [_vehicle_to_response(v) for v in vehicles]


@router.post("", response_model=VehicleResponse)
def create_vehicle(
    req: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicle = Vehicle(user_id=current_user.id, **req.model_dump())
    db.add(vehicle)
    db.flush()
    for check_type in DEFAULT_CHECKS:
        check = VehicleCheck(vehicle_id=vehicle.id, check_type=check_type)
        db.add(check)
    db.commit()
    db.refresh(vehicle)
    return _vehicle_to_response(vehicle)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다")
    return _vehicle_to_response(vehicle)


@router.put("/{vehicle_id}/mileage")
def update_mileage(
    vehicle_id: int,
    mileage: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다")
    vehicle.mileage = mileage
    db.commit()
    return {"ok": True}


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다")
    db.delete(vehicle)
    db.commit()
    return {"ok": True}


@router.put("/{vehicle_id}/checks/{check_id}")
def update_vehicle_check(
    vehicle_id: int,
    check_id: int,
    req: VehicleCheckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check = db.query(VehicleCheck).join(Vehicle).filter(
        VehicleCheck.id == check_id,
        Vehicle.id == vehicle_id,
        Vehicle.user_id == current_user.id,
    ).first()
    if not check:
        raise HTTPException(status_code=404, detail="점검 항목을 찾을 수 없습니다")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(check, key, value)
    db.commit()
    db.refresh(check)
    return {
        "id": check.id,
        "vehicle_id": check.vehicle_id,
        "check_type": check.check_type,
        "last_check_date": check.last_check_date,
        "next_check_date": check.next_check_date,
        "days_left": check.days_left,
    }

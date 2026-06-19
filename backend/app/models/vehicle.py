from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    name = Column(String, nullable=False)
    plate = Column(String, nullable=False)
    mileage = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="vehicles")
    family = relationship("Family", back_populates="vehicles")
    checks = relationship("VehicleCheck", back_populates="vehicle")


class VehicleCheck(Base):
    __tablename__ = "vehicle_checks"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    check_type = Column(String, nullable=False)
    last_check_date = Column(Date, nullable=True)
    next_check_date = Column(Date, nullable=True)
    last_mileage = Column(Integer, nullable=True)
    interval_mileage = Column(Integer, nullable=True)
    memo = Column(String, nullable=True)
    receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="checks")

    @property
    def days_left(self) -> int | None:
        from datetime import date
        if self.next_check_date:
            return (self.next_check_date - date.today()).days
        return None

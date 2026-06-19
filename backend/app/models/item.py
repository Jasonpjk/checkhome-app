from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, Enum, Text, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class ItemStatus(str, enum.Enum):
    normal = "normal"
    warning = "warning"
    imminent = "imminent"
    expired = "expired"
    check_needed = "check-needed"


class RiskLevel(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ActionType(str, enum.Enum):
    completed = "completed"
    disposed = "disposed"
    replaced = "replaced"
    kept = "kept"
    check_requested = "check_requested"


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=True)
    expiry_date = Column(Date, nullable=True)
    open_date = Column(Date, nullable=True)
    pao_days = Column(Integer, nullable=True)
    photo_url = Column(String, nullable=True)
    handler_name = Column(String, nullable=True)
    is_family_shared = Column(Boolean, default=False)
    quantity = Column(Integer, default=1)
    memo = Column(Text, nullable=True)
    risk = Column(Enum(RiskLevel), default=RiskLevel.medium)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="items", foreign_keys=[user_id])
    family = relationship("Family", back_populates="items")
    action_logs = relationship("ActionLog", back_populates="item")

    @property
    def days_left(self) -> int | None:
        from datetime import date
        if self.expiry_date:
            return (self.expiry_date - date.today()).days
        if self.open_date and self.pao_days:
            end_date = self.open_date + __import__("datetime").timedelta(days=self.pao_days)
            return (end_date - date.today()).days
        return None

    @property
    def status(self) -> str:
        dl = self.days_left
        if dl is None:
            return ItemStatus.normal
        if dl < 0:
            return ItemStatus.expired
        if dl <= 3:
            return ItemStatus.imminent
        if dl <= 30:
            return ItemStatus.warning
        return ItemStatus.normal


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="action_logs")

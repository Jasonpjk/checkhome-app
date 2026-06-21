from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, Enum, Text, func
from sqlalchemy.orm import relationship
from datetime import date, timedelta
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


# 카테고리별 (임박, 주의) 판정 일수.
# 유통기한이 다가올 때 '언제부터 경고할지'를 카테고리 특성에 맞게 다르게 적용한다.
# 예) 식품은 임박했을 때(3일 전)만, 소화기/문서는 한 달 전부터 미리 알림.
# 키는 items.category 에 저장되는 한글 라벨과 일치해야 함.
CATEGORY_THRESHOLDS = {
    "식품": (3, 14),
    "약품": (14, 60),
    "욕실/화장품": (14, 60),
    "세제/청소": (14, 90),
    "필터/가전": (14, 60),
    "차량": (30, 90),
    "육아용품": (7, 30),
    "반려동물": (7, 30),
    "비상용품": (30, 90),
    "문서/보증서": (30, 90),
    "캠핑용품": (14, 60),
    "정원용품": (14, 60),
}
DEFAULT_THRESHOLD = (3, 30)  # 미지정 카테고리는 기존 동작과 동일


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
    photo_url = Column(String, nullable=True)         # 대표 사진(첫 장) - 하위호환
    photos = Column(Text, nullable=True)              # 여러 장 사진 (JSON 배열 문자열)
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
        if self.expiry_date:
            return (self.expiry_date - date.today()).days
        if self.open_date and self.pao_days:
            end_date = self.open_date + timedelta(days=self.pao_days)
            return (end_date - date.today()).days
        return None

    @property
    def status(self) -> str:
        dl = self.days_left
        if dl is None:
            return ItemStatus.normal.value
        if dl < 0:
            return ItemStatus.expired.value
        # 만료(expired)는 공통(dl<0), 임박/주의 시점만 카테고리별로 다르게 적용
        imminent_d, warning_d = CATEGORY_THRESHOLDS.get(self.category, DEFAULT_THRESHOLD)
        if dl <= imminent_d:
            return ItemStatus.imminent.value
        if dl <= warning_d:
            return ItemStatus.warning.value
        return ItemStatus.normal.value


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="action_logs")

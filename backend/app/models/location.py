from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class StorageLocation(Base):
    """보관 위치 마스터 목록 (냉장고·창고 등). 등록 화면에서 위치를 고를 때 사용.
    가족에 속하면 family_id 로 가족 공통 목록을 공유한다."""
    __tablename__ = "storage_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    name = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_location_name"),)

    owner = relationship("User")

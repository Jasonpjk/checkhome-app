from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class MemberRole(str, enum.Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"
    executor = "executor"


class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("FamilyMember", back_populates="family")
    items = relationship("Item", back_populates="family")
    vehicles = relationship("Vehicle", back_populates="family")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(MemberRole), default=MemberRole.editor, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    family = relationship("Family", back_populates="members")
    user = relationship("User", back_populates="family_memberships")

from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False, server_default="false")
    email_verified = Column(Boolean, default=False, server_default="false", nullable=False)
    verification_code = Column(String, nullable=True)
    verification_expires_at = Column(DateTime(timezone=True), nullable=True)
    verification_attempts = Column(Integer, default=0, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_memberships = relationship("FamilyMember", back_populates="user")
    items = relationship("Item", back_populates="owner", foreign_keys="Item.user_id")
    vehicles = relationship("Vehicle", back_populates="owner")
    subscription = relationship("Subscription", back_populates="user", uselist=False)

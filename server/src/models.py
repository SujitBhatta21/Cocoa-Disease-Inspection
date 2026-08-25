"""SQLAlchemy persistence models."""

import datetime
import uuid

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base
from src.role import UserRole


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    users: Mapped[list["User"]] = relationship(back_populates="organisation")

class User(Base):
    __tablename__= "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Foreign key
    organisation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False) 
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(default=UserRole.USER, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    organisation: Mapped[Organisation] = relationship(back_populates="users")
    inspections: Mapped[list["Inspection"]] = relationship(back_populates="user")

class Inspection(Base):
    __tablename__= "inspections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    prediction: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # Adding below two attributes if confidence is low for the prediction.
    human_corrected: Mapped[bool] = mapped_column(Boolean, default=False)
    corrected_label: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    user: Mapped[User] = relationship(back_populates="inspections")

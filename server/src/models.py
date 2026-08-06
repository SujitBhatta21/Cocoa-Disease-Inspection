"""
REFERENCE: techwithtim https://youtu.be/SR5NYCdzKkc?si=S4brh9r0xBn5mz-j&t=2609
Used this video as a reference for initial setup with sqlalchemy for async operations.
"""

from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import relationship, Mapped, mapped_column
import datetime 
from src.db import Base


class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.timezone.utc)
    users: Mapped[list["User"]] = relationship(back_populates="organisation")

class User(Base):
    __tablename__= "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Foreign key
    organisation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False) 
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

class Inspection(Base):
    __tablename__= "inspections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[User] = mapped_column(ForeignKey("inspections.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    prediction: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # Adding below two attributes if confidence is low for the prediction.
    human_corrected: Mapped[bool] = mapped_column(Boolean, nullable=True)
    corrected_label: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.timezone.utc)


"""
REFERENCE: techwithtim https://youtu.be/SR5NYCdzKkc?si=S4brh9r0xBn5mz-j&t=2609
Used this video as a reference for initial setup with sqlalchemy.
"""

from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
import datetime 


class Base(DeclarativeBase):
    pass

sqlite_file_name = "cocoa.db"
DATABASE_URL = f"sqlite+aiosqlite:///{sqlite_file_name}"


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
    organisation_id: Mapped[Organisation] = mapped_column(ForeignKey("users.id"), nullable=False) 
    email: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)

class Inspection(Base):
    __tablename__= "inspections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[User] = mapped_column(ForeignKey("inspection.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    prediction: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # Adding below two attributes if confidence is low for the prediction.
    human_corrected: Mapped[bool] = mapped_column(Boolean, nullable=True)
    corrected_label: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.timezone.utc)


engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(DeclarativeBase.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
    
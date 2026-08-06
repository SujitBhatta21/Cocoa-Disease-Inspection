"""
REFERENCE: techwithtim https://youtu.be/SR5NYCdzKkc?si=S4brh9r0xBn5mz-j&t=2609
Used this video as a reference for initial setup with sqlalchemy.
"""

from collections.abc import AsyncGenerator
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import datetime 



DATABASE_URL = "postgresql+asyncpg://sujitbhatta:root@localhost:5432/cocoaDB"

engine = create_async_engine(DATABASE_URL)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


Base = declarative_base()


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as db_session:
        yield db_session 


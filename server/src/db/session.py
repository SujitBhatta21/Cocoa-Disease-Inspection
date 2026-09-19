"""Database engine, SQLAlchemy base, and session dependency."""

from collections.abc import AsyncGenerator
from dotenv import load_dotenv
import os

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from typing import Annotated
from fastapi import Depends


load_dotenv()


DATABASE_URL = os.getenv('DATABASE_URL_PRODUCTION')

if DATABASE_URL is None:
    raise RuntimeError("DATABASE_URL environment variable is not set")


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables() -> None:
    # Importing registers the models on Base.metadata before create_all runs.
    from src import models  # noqa: F401

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


# Using this global session dependency throughout services for database fetch/post.
SessionDependency = Annotated[AsyncSession, Depends(get_db_session)]
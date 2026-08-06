import src.models as models, src.schema as schema
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from src.db import engine, SessionLocal, create_db_and_tables, get_async_db_session
from sqlalchemy.orm import Session
from sqlalchemy import select


@asynccontextmanager
async def lifespan(src: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# db_dependency = Annotated[Session, Depends(get_db)]


text_posts = {"1": {"title": "New Post", "content": "cool project test post"}}



@app.post("/create_user")
async def create_user(user: schema.UserResponse, 
                      session: AsyncSession = Depends(get_async_db_session)):
    user = user
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user



@app.get("/feed")
async def get_feed(
    session:AsyncSession = Depends(get_async_db_session)
):
    result = await session.execute(select(models.User). order_by(models.User.created_at.desc()))
    posts = [row[0] for row in result.all()]






@app.get("/")
async def root():
    return {"message": "Hello World"}


"""
LOAD ONNX model once here in this file.
"""
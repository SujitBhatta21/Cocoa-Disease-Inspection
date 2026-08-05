from fastapi import FastAPI, HTTPException
from src.schema import Testing
from src.db import create_db_and_tables, get_async_session, Organisation, User, Inspection
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(src: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)




text_posts = {"1": {"title": "New Post", "content": "cool project test post"}}

@app.get("/post")
def get_all_posts():
    return text_posts



@app.get("/")
async def root():
    return {"message": "Hello World"}


"""
LOAD ONNX model once here in this file.
"""
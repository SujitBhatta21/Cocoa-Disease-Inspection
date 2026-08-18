from typing import Annotated
from contextlib import asynccontextmanager
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

from src.api.inspect import router as inspection_router
from src.database import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    await engine.dispose()


app = FastAPI(title="Cocoa Disease Inspection API", lifespan=lifespan)
app.include_router(inspection_router, prefix="/api/v1")


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://dad-reflux-goldmine.ngrok-free.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


"""
POST /inspect

POST /override

GET /images

GET /statistics

GET /export
"""

@app.get("/statistics")
async def getStatistics(): # For admin
    return

# TODO: Exporting the new thing
@app.get("/export")
async def getExport():
    return 



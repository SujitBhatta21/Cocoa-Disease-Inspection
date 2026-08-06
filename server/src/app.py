from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.api.inspect import router as inspection_router
from src.database import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    await engine.dispose()


app = FastAPI(title="Cocoa Disease Inspection API", lifespan=lifespan)
app.include_router(inspection_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


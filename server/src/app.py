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


"""
POST /inspect

POST /override

GET /images

GET /statistics

GET /export
"""
@app.post("/inspect")
async def inspect():
    return

@app.post("/override")
async def override():
    return # might be optional

@app.get("/images")
async def images():
    return {"How are you": "daka"}

@app.get("/statistics")
async def getStatistics(): # For admin
    return

# TODO: Exporting the new thing
@app.get("/export")
async def getExport():
    return 



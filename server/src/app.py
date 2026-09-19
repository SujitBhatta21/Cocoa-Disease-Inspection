from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import api_router
from src.db.seed import seed_database
from src.db.session import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    await seed_database()
    
    yield
    await engine.dispose()


app = FastAPI(title="Cocoa Disease Inspection API", lifespan=lifespan)
app.include_router(api_router, prefix="/api/v1")


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://dad-reflux-goldmine.ngrok-free.dev",
    "https://cocoa-disease-inspection.vercel.app",
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

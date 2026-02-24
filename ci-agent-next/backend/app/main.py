import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import (
    competitors_col,
    reports_col,
    snapshots_col,
    users_col,
)
from app.routers import auth, competitors, notifications, reports, scrape


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    await users_col.create_index("email", unique=True)
    await competitors_col.create_index([("user_id", 1)])
    await reports_col.create_index([("user_id", 1), ("created_at", -1)])
    await reports_col.create_index([("competitor_id", 1)])
    await snapshots_col.create_index([("competitor_id", 1), ("created_at", -1)])
    yield


app = FastAPI(
    title="CI Agent API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https?://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(competitors.router)
app.include_router(reports.router)
app.include_router(scrape.router)
app.include_router(notifications.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


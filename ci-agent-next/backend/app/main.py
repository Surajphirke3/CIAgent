import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import (
    alert_preferences_col,
    competitors_col,
    reports_col,
    scan_logs_col,
    scrape_jobs_col,
    signals_col,
    snapshots_col,
    users_col,
)
from app.routers import auth, competitors, notifications, reports, scrape, signals
from app.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    import logging
    _log = logging.getLogger("app.main")

    # ── MongoDB indexes (non-fatal if DB is temporarily unreachable) ────────
    try:
        await users_col.create_index("email", unique=True)
        await competitors_col.create_index([("user_id", 1)])
        await reports_col.create_index([("user_id", 1), ("created_at", -1)])
        await reports_col.create_index([("competitor_id", 1)])
        await reports_col.create_index([("user_id", 1), ("read", 1)])

        # Snapshots: TTL 90 days + query index
        await snapshots_col.create_index([("competitor_id", 1), ("created_at", -1)])
        await snapshots_col.create_index("created_at", expireAfterSeconds=7_776_000)  # 90 days

        # Signals: query indexes + compound dedup index
        await signals_col.create_index([("user_id", 1), ("detected_at", -1)])
        await signals_col.create_index([("user_id", 1), ("type", 1)])
        await signals_col.create_index([("user_id", 1), ("read", 1)])
        await signals_col.create_index(
            [("user_id", 1), ("competitor_id", 1), ("type", 1), ("detected_at", -1)]
        )

        await scan_logs_col.create_index([("user_id", 1), ("scanned_at", -1)])
        await alert_preferences_col.create_index("user_id", unique=True)

        # Scrape jobs: TTL 30 days
        await scrape_jobs_col.create_index("started_at", expireAfterSeconds=2_592_000)  # 30 days

        _log.info("MongoDB indexes ensured.")
    except Exception as exc:  # noqa: BLE001
        _log.warning("MongoDB index creation skipped (DB may be unreachable): %s", exc)


    # ── Start CRON scheduler ────────────────────────────────────────────────
    try:
        start_scheduler()
    except Exception as exc:  # noqa: BLE001
        _log.warning("APScheduler failed to start: %s", exc)

    yield

    # ── Shutdown ────────────────────────────────────────────────────────────
    stop_scheduler()


app = FastAPI(
    title="CI Agent API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url, 
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://ci-agent-next.vercel.app"
    ],
    allow_origin_regex=r"https?://(localhost:\d+|.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(competitors.router)
app.include_router(reports.router)
app.include_router(scrape.router)
app.include_router(notifications.router)
app.include_router(signals.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

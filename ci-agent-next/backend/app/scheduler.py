"""
APScheduler CRON Jobs:
1. Weekly Intelligence Scan — Monday 06:00 UTC (parallel scraping)
2. Weekly Digest Email    — Sunday 20:00 UTC
"""
import asyncio
import logging
from datetime import datetime, timedelta
from uuid import uuid4

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import competitors_col, signals_col, users_col

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


# ── Weekly Intelligence Scan ─────────────────────────────────────────────────

async def _weekly_scrape_all():
    """Scrape all active competitors for all users — runs in parallel (max 5 concurrent)."""
    from app.routers.scrape import run_scrape_job  # avoid circular import at load time
    from bson import ObjectId

    run_id = str(uuid4())
    logger.info("[Scheduler][%s] Weekly intelligence scan starting…", run_id)

    # Collect all active competitors with their user emails
    tasks = []
    async for comp in competitors_col.find({"status": "active"}):
        user_id = comp.get("user_id", "")
        user_email = ""
        try:
            user = await users_col.find_one({"_id": ObjectId(user_id)})
            user_email = user["email"] if user else ""
        except Exception:  # noqa: BLE001
            pass
        tasks.append((str(comp["_id"]), user_id, user_email, comp.get("name", "?")))

    if not tasks:
        logger.info("[Scheduler][%s] No active competitors found — scan skipped.", run_id)
        return

    logger.info("[Scheduler][%s] Scanning %d competitors (parallel, max 5 concurrent)", run_id, len(tasks))

    # Bounded parallel execution
    sem = asyncio.Semaphore(5)
    succeeded = 0
    failed = 0

    async def _bounded(comp_id, uid, email, name):
        nonlocal succeeded, failed
        async with sem:
            try:
                await run_scrape_job(comp_id, uid, email)
                succeeded += 1
            except Exception as exc:  # noqa: BLE001
                failed += 1
                logger.error("[Scheduler][%s] Scrape failed for %s: %s", run_id, name, exc)

    await asyncio.gather(*[_bounded(*t) for t in tasks], return_exceptions=True)
    logger.info(
        "[Scheduler][%s] Weekly scan complete — %d succeeded, %d failed",
        run_id, succeeded, failed
    )


# ── Weekly Digest Email ───────────────────────────────────────────────────────

async def _send_weekly_digests():
    """Send weekly digest emails to all users who have the weekly_digest preference enabled."""
    from app.services.notifier import send_weekly_digest  # avoid circular import

    logger.info("[Scheduler] Weekly digest job starting…")
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Iterate all users with weekly_digest enabled
    async for user in users_col.find({"preferences.weekly_digest": True}):
        user_id = str(user["_id"])
        email = user.get("email", "")
        if not email:
            continue

        # Aggregate signals per competitor for this user over the past 7 days
        pipeline = [
            {"$match": {"user_id": user_id, "detected_at": {"$gte": week_ago}}},
            {"$group": {
                "_id": "$competitor_id",
                "competitor_name": {"$first": "$competitor_name"},
                "signal_count": {"$sum": 1},
                "top_type": {"$first": "$type"},
                "max_risk": {"$max": "$risk_score"},
            }},
            {"$sort": {"max_risk": -1}},
        ]

        summaries = []
        async for doc in signals_col.aggregate(pipeline):
            summaries.append({
                "name": doc["competitor_name"],
                "signal_count": doc["signal_count"],
                "top_type": doc["top_type"],
                "risk_score": doc["max_risk"],
            })

        try:
            await send_weekly_digest(email, summaries)
        except Exception as exc:  # noqa: BLE001
            logger.error("[Scheduler] Weekly digest failed for %s: %s", email, exc)

    logger.info("[Scheduler] Weekly digest job complete.")


# ── Lifecycle ─────────────────────────────────────────────────────────────────

def start_scheduler():
    """Register all jobs and start the scheduler. Call from app lifespan."""
    scheduler.add_job(
        _weekly_scrape_all,
        trigger=CronTrigger(day_of_week="mon", hour=6, minute=0, timezone="UTC"),
        id="weekly_scrape_all",
        replace_existing=True,
        name="Weekly Intelligence Scan (Mon 06:00 UTC)",
    )
    scheduler.add_job(
        _send_weekly_digests,
        trigger=CronTrigger(day_of_week="sun", hour=20, minute=0, timezone="UTC"),
        id="weekly_digest",
        replace_existing=True,
        name="Weekly Digest Email (Sun 20:00 UTC)",
    )
    scheduler.start()
    logger.info("[Scheduler] APScheduler started — Next scan: Monday 06:00 UTC | Next digest: Sunday 20:00 UTC")


def stop_scheduler():
    """Graceful shutdown."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[Scheduler] APScheduler stopped.")

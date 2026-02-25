"""
Scrape Router — triggers competitor scraping jobs.
Uses hash fingerprinting to skip unchanged pages and deduplication
to prevent duplicate signals within a 24h window.
"""
import logging
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends

from app.database import (
    competitors_col,
    reports_col,
    scan_logs_col,
    scrape_jobs_col,
    signals_col,
    snapshots_col,
)
from app.middleware.auth import get_current_user
from app.models.report import DiffItem, Report
from app.services.ai_analyzer import analyze_changes
from app.services.differ import compute_diffs
from app.services.notifier import send_email_alert, send_slack_alert
from app.services.scraper import scrape_competitor, snapshot_hash
from app.services.signal_detector import calculate_risk_score, classify_signal

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scrape", tags=["scrape"])


async def _is_duplicate_signal(
    competitor_id: str, signal_type: str, user_id: str
) -> bool:
    """Returns True if an identical signal type for this competitor exists in last 24h."""
    cutoff = datetime.utcnow() - timedelta(hours=24)
    count = await signals_col.count_documents({
        "competitor_id": competitor_id,
        "type": signal_type,
        "user_id": user_id,
        "detected_at": {"$gte": cutoff},
    })
    return count > 0


async def run_scrape_job(competitor_id: str, user_id: str, user_email: str):
    job_doc = {
        "competitor_id": competitor_id,
        "user_id": user_id,
        "started_at": datetime.utcnow(),
        "status": "running",
    }
    job = await scrape_jobs_col.insert_one(job_doc)
    job_id = job.inserted_id

    async def _fail(reason: str):
        logger.error("[Scrape] Job failed for %s: %s", competitor_id, reason)
        await scrape_jobs_col.update_one(
            {"_id": job_id},
            {"$set": {"status": "failed", "error": reason, "finished_at": datetime.utcnow()}},
        )

    try:
        competitor = await competitors_col.find_one({"_id": ObjectId(competitor_id)})
        if not competitor:
            await _fail("Competitor not found")
            return

        logger.info("[Scrape] Starting scrape for %s (%s)", competitor["name"], competitor["url"])

        # ── Scrape (retry logic inside scrape_competitor) ─────────────────
        new_snapshot = await scrape_competitor(
            str(competitor["url"]),
            competitor.get("watch_sections", ["homepage"]),
        )

        # ── Record scan log ───────────────────────────────────────────────
        await scan_logs_col.insert_one({
            "competitor_id": competitor_id,
            "competitor_name": competitor["name"],
            "user_id": user_id,
            "scanned_at": datetime.utcnow(),
        })

        # ── Hash fingerprint — skip if content unchanged ───────────────────
        new_hash = snapshot_hash(new_snapshot)

        prev = await snapshots_col.find_one(
            {"competitor_id": competitor_id},
            sort=[("created_at", -1)],
        )
        old_snapshot = prev.get("content", {}) if prev else {}
        old_hash = prev.get("content_hash", "") if prev else ""

        # Store new snapshot with hash
        await snapshots_col.insert_one({
            "competitor_id": competitor_id,
            "content": new_snapshot,
            "content_hash": new_hash,
            "created_at": datetime.utcnow(),
        })

        # Retain only last 5 snapshots
        latest_ids = [
            doc["_id"]
            async for doc in snapshots_col.find(
                {"competitor_id": competitor_id},
                sort=[("created_at", -1)],
                limit=5,
            )
        ]
        await snapshots_col.delete_many(
            {"competitor_id": competitor_id, "_id": {"$nin": latest_ids}}
        )

        if new_hash == old_hash and old_hash:
            logger.info("[Scrape] No change detected for %s (hash match) — skipping", competitor["name"])
            await scrape_jobs_col.update_one(
                {"_id": job_id},
                {"$set": {"status": "completed", "info": "No change (hash match)", "finished_at": datetime.utcnow()}},
            )
            return

        # ── Compute diffs ─────────────────────────────────────────────────
        diffs = compute_diffs(old_snapshot, new_snapshot)
        if not diffs:
            await scrape_jobs_col.update_one(
                {"_id": job_id},
                {"$set": {"status": "completed", "info": "No meaningful changes", "finished_at": datetime.utcnow()}},
            )
            return

        logger.info("[Scrape] %d diffs detected for %s", len(diffs), competitor["name"])

        # ── AI Analysis ───────────────────────────────────────────────────
        ai_summary, severity = await analyze_changes(competitor["name"], diffs)

        # ── Classify signal ───────────────────────────────────────────────
        signal_type, impact_level = classify_signal(diffs, ai_summary)
        risk_score = calculate_risk_score(diffs, ai_summary)

        # ── Deduplication check ───────────────────────────────────────────
        if await _is_duplicate_signal(competitor_id, signal_type, user_id):
            logger.info(
                "[Scrape] Skipping duplicate %s signal for %s (already detected in last 24h)",
                signal_type, competitor["name"],
            )
        else:
            await signals_col.insert_one({
                "competitor_id": competitor_id,
                "competitor_name": competitor["name"],
                "user_id": user_id,
                "type": signal_type,
                "impact_level": impact_level,
                "risk_score": risk_score,
                "description": ai_summary[:1000],
                "diffs": [d.model_dump() for d in diffs],
                "detected_at": datetime.utcnow(),
                "read": False,
            })
            logger.info(
                "[Scrape] Signal created: type=%s impact=%s risk=%d for %s",
                signal_type, impact_level, risk_score, competitor["name"],
            )

        # ── Update competitor risk score ───────────────────────────────────
        await competitors_col.update_one(
            {"_id": ObjectId(competitor_id)},
            {"$set": {"risk_score": risk_score, "last_scraped": datetime.utcnow()}},
        )

        # ── Save full report ──────────────────────────────────────────────
        report_doc = {
            "competitor_id": competitor_id,
            "competitor_name": competitor["name"],
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "diffs": [d.model_dump() for d in diffs],
            "ai_summary": ai_summary,
            "severity": severity,
            "signal_type": signal_type,
            "risk_score": risk_score,
            "notified": False,
            "read": False,
        }
        result = await reports_col.insert_one(report_doc)

        report = Report(
            id=str(result.inserted_id),
            competitor_id=competitor_id,
            competitor_name=competitor["name"],
            user_id=user_id,
            created_at=datetime.utcnow(),
            diffs=[DiffItem(**d) for d in report_doc["diffs"]],
            ai_summary=ai_summary,
            severity=severity,
            notified=False,
        )

        # ── Send notifications ────────────────────────────────────────────
        if competitor.get("notify_email"):
            await send_email_alert(user_email, report)
        if competitor.get("notify_slack"):
            await send_slack_alert(report)

        await reports_col.update_one(
            {"_id": result.inserted_id},
            {"$set": {"notified": True}},
        )

        await scrape_jobs_col.update_one(
            {"_id": job_id},
            {"$set": {"status": "completed", "finished_at": datetime.utcnow()}},
        )
        logger.info("[Scrape] Job completed for %s", competitor["name"])

    except Exception as exc:  # noqa: BLE001
        await _fail(str(exc))


@router.post("/trigger/{competitor_id}")
async def trigger_scrape(
    competitor_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    background_tasks.add_task(
        run_scrape_job,
        competitor_id,
        str(current_user["_id"]),
        current_user["email"],
    )
    return {"message": "Scrape job queued", "competitor_id": competitor_id}


@router.post("/trigger-all")
async def trigger_all_scrapes(
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    cursor = competitors_col.find(
        {"user_id": str(current_user["_id"]), "status": "active"}
    )
    competitors = await cursor.to_list(length=100)

    for comp in competitors:
        background_tasks.add_task(
            run_scrape_job,
            str(comp["_id"]),
            str(current_user["_id"]),
            current_user["email"],
        )

    return {"message": f"Queued {len(competitors)} scrape jobs"}

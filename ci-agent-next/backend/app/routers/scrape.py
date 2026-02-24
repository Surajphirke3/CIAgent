from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends

from app.database import (
    competitors_col,
    reports_col,
    scrape_jobs_col,
    snapshots_col,
)
from app.middleware.auth import get_current_user
from app.models.report import DiffItem, Report
from app.services.ai_analyzer import analyze_changes
from app.services.differ import compute_diffs
from app.services.notifier import send_email_alert, send_slack_alert
from app.services.scraper import scrape_competitor


router = APIRouter(prefix="/scrape", tags=["scrape"])


async def run_scrape_job(competitor_id: str, user_id: str, user_email: str):
    job_doc = {
        "competitor_id": competitor_id,
        "user_id": user_id,
        "started_at": datetime.utcnow(),
        "status": "running",
    }
    job = await scrape_jobs_col.insert_one(job_doc)

    try:
        competitor = await competitors_col.find_one({"_id": ObjectId(competitor_id)})
        if not competitor:
            await scrape_jobs_col.update_one(
                {"_id": job.inserted_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": "Competitor not found",
                        "finished_at": datetime.utcnow(),
                    }
                },
            )
            return

        new_snapshot = await scrape_competitor(
            str(competitor["url"]),
            competitor.get("watch_sections", ["homepage"]),
        )

        prev = await snapshots_col.find_one(
            {"competitor_id": competitor_id},
            sort=[("created_at", -1)],
        )
        old_snapshot = prev["content"] if prev else {}

        await snapshots_col.insert_one(
            {
                "competitor_id": competitor_id,
                "content": new_snapshot,
                "created_at": datetime.utcnow(),
            }
        )

        # retain only last 5 snapshots
        latest_ids = [
            doc["_id"]
            async for doc in snapshots_col.find(
                {"competitor_id": competitor_id},
                sort=[("created_at", -1)],
                limit=5,
            )
        ]
        await snapshots_col.delete_many(
            {
                "competitor_id": competitor_id,
                "_id": {"$nin": latest_ids},
            }
        )

        diffs = compute_diffs(old_snapshot, new_snapshot)
        if not diffs:
            await scrape_jobs_col.update_one(
                {"_id": job.inserted_id},
                {
                    "$set": {
                        "status": "completed",
                        "finished_at": datetime.utcnow(),
                        "info": "No meaningful changes",
                    }
                },
            )
            return

        ai_summary, severity = await analyze_changes(competitor["name"], diffs)

        report_doc = {
            "competitor_id": competitor_id,
            "competitor_name": competitor["name"],
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "diffs": [d.model_dump() for d in diffs],
            "ai_summary": ai_summary,
            "severity": severity,
            "notified": False,
        }
        result = await reports_col.insert_one(report_doc)

        await competitors_col.update_one(
            {"_id": ObjectId(competitor_id)},
            {"$set": {"last_scraped": datetime.utcnow()}},
        )

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

        if competitor.get("notify_email"):
            await send_email_alert(user_email, report)
        if competitor.get("notify_slack"):
            await send_slack_alert(report)

        await reports_col.update_one(
            {"_id": result.inserted_id},
            {"$set": {"notified": True}},
        )

        await scrape_jobs_col.update_one(
            {"_id": job.inserted_id},
            {
                "$set": {
                    "status": "completed",
                    "finished_at": datetime.utcnow(),
                }
            },
        )
    except Exception as exc:  # noqa: BLE001
        await scrape_jobs_col.update_one(
            {"_id": job.inserted_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(exc),
                    "finished_at": datetime.utcnow(),
                }
            },
        )


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


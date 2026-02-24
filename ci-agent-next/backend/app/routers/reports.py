from typing import List, Dict

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta

from app.database import reports_col
from app.middleware.auth import get_current_user
from app.models.report import Report


router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/stats")
async def get_report_stats(current_user=Depends(get_current_user)):
    # Start of today (UTC)
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Query for all reports today
    cursor = reports_col.find({
        "user_id": str(current_user["_id"]),
        "created_at": {"$gte": start_of_today}
    })
    
    docs = await cursor.to_list(length=1000)
    
    stats = {
        "total": len(docs),
        "high": 0,
        "medium": 0,
        "low": 0
    }
    
    for doc in docs:
        sev = doc.get("severity", "low")
        if sev in stats:
            stats[sev] += 1
            
    return stats


@router.get("/", response_model=List[Report])
async def list_reports(current_user=Depends(get_current_user)):
    cursor = reports_col.find(
        {"user_id": str(current_user["_id"])},
        sort=[("created_at", -1)],
    )
    docs = await cursor.to_list(length=100)
    results: List[Report] = []
    for d in docs:
        results.append(
            Report(
                id=str(d["_id"]),
                competitor_id=d["competitor_id"],
                competitor_name=d["competitor_name"],
                user_id=d["user_id"],
                created_at=d["created_at"],
                diffs=d["diffs"],
                ai_summary=d["ai_summary"],
                severity=d["severity"],
                notified=d.get("notified", False),
                read=d.get("read", False),
            )
        )
    return results


@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str, current_user=Depends(get_current_user)):
    doc = await reports_col.find_one(
        {"_id": ObjectId(report_id), "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return Report(
        id=str(doc["_id"]),
        competitor_id=doc["competitor_id"],
        competitor_name=doc["competitor_name"],
        user_id=doc["user_id"],
        created_at=doc["created_at"],
        diffs=doc["diffs"],
        ai_summary=doc["ai_summary"],
        severity=doc["severity"],
        notified=doc.get("notified", False),
        read=doc.get("read", False),
    )


@router.patch("/{report_id}/read", response_model=Report)
async def mark_report_read(report_id: str, current_user=Depends(get_current_user)):
    doc = await reports_col.find_one_and_update(
        {"_id": ObjectId(report_id), "user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return Report(
        id=str(doc["_id"]),
        competitor_id=doc["competitor_id"],
        competitor_name=doc["competitor_name"],
        user_id=doc["user_id"],
        created_at=doc["created_at"],
        diffs=doc["diffs"],
        ai_summary=doc["ai_summary"],
        severity=doc["severity"],
        notified=doc.get("notified", False),
        read=doc.get("read", False),
    )


@router.patch("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_reports_read(current_user=Depends(get_current_user)):
    await reports_col.update_many(
        {"user_id": str(current_user["_id"])},
        {"$set": {"read": True}}
    )
    return None

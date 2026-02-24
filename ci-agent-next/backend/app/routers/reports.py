from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import reports_col
from app.middleware.auth import get_current_user
from app.models.report import Report


router = APIRouter(prefix="/reports", tags=["reports"])


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
    )


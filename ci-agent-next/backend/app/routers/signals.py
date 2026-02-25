from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import scan_logs_col, signals_col
from app.middleware.auth import get_current_user
from app.models.signal import Signal, SignalStats


router = APIRouter(prefix="/signals", tags=["signals"])


def _doc_to_signal(d: dict) -> Signal:
    return Signal(
        id=str(d["_id"]),
        competitor_id=d["competitor_id"],
        competitor_name=d["competitor_name"],
        user_id=d["user_id"],
        type=d.get("type", "web_update"),
        impact_level=d.get("impact_level", "low"),
        risk_score=d.get("risk_score", 0),
        description=d.get("description", ""),
        diffs=d.get("diffs", []),
        detected_at=d["detected_at"],
        read=d.get("read", False),
    )


@router.get("/stats", response_model=SignalStats)
async def get_signal_stats(current_user=Depends(get_current_user)):
    """Return high/medium/low signal counts + total scanned today."""
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Count unread signals by impact level
    pipeline = [
        {"$match": {"user_id": user_id, "read": False}},
        {"$group": {"_id": "$impact_level", "count": {"$sum": 1}}},
    ]
    agg = signals_col.aggregate(pipeline)
    counts = {"high": 0, "medium": 0, "low": 0}
    async for doc in agg:
        lvl = doc["_id"]
        if lvl in counts:
            counts[lvl] = doc["count"]

    # Total scan log entries for today
    scanned_today = await scan_logs_col.count_documents({
        "user_id": user_id,
        "scanned_at": {"$gte": start_of_today},
    })

    return SignalStats(
        high=counts["high"],
        medium=counts["medium"],
        low=counts["low"],
        scanned_today=scanned_today,
    )


@router.get("/", response_model=List[Signal])
async def list_signals(
    type: Optional[str] = Query(None, description="Filter by signal type"),
    unread: Optional[bool] = Query(None, description="If true return only unread signals"),
    limit: int = Query(50, le=200),
    current_user=Depends(get_current_user),
):
    """List signals for the authenticated user, optionally filtered."""
    user_id = str(current_user["_id"])
    query: dict = {"user_id": user_id}

    if type:
        query["type"] = type.lower()
    if unread is True:
        query["read"] = False

    cursor = signals_col.find(query, sort=[("detected_at", -1)], limit=limit)
    docs = await cursor.to_list(length=limit)
    return [_doc_to_signal(d) for d in docs]


@router.patch("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_signals_read(current_user=Depends(get_current_user)):
    """Mark all unread signals for the user as read."""
    await signals_col.update_many(
        {"user_id": str(current_user["_id"]), "read": False},
        {"$set": {"read": True}},
    )
    return None


@router.patch("/{signal_id}/read", response_model=Signal)
async def mark_signal_read(signal_id: str, current_user=Depends(get_current_user)):
    """Dismiss / mark a single signal as read."""
    try:
        oid = ObjectId(signal_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid signal id")

    doc = await signals_col.find_one_and_update(
        {"_id": oid, "user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return _doc_to_signal(doc)

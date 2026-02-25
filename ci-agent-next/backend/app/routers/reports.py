from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException, status

from app.database import competitors_col, reports_col, scan_logs_col, signals_col
from app.middleware.auth import get_current_user
from app.models.report import Report
from app.services.ai_analyzer import generate_strategic_report
from app.services.notifier import trigger_n8n_agent


router = APIRouter(prefix="/reports", tags=["reports"])


def _doc_to_report(d: dict) -> Report:
    return Report(
        id=str(d["_id"]),
        competitor_id=d["competitor_id"],
        competitor_name=d["competitor_name"],
        user_id=d["user_id"],
        created_at=d["created_at"],
        diffs=d["diffs"],
        ai_summary=d["ai_summary"],
        severity=d["severity"],
        report_type=d.get("report_type", "competitor_profile"),
        competitors_included=d.get("competitors_included", []),
        executive_summary=d.get("executive_summary", ""),
        strategic_insights=d.get("strategic_insights", []),
        recommendations=d.get("recommendations", []),
        market_trend=d.get("market_trend", ""),
        competitor_insights=d.get("competitor_insights", []),
        overall_risk_level=d.get("overall_risk_level", "low"),
        notified=d.get("notified", False),
        read=d.get("read", False),
    )


# ── Stats endpoint ────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_report_stats(current_user=Depends(get_current_user)):
    """Return high/medium/low report counts + total scanned today."""
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Count unread reports by severity (today)
    cursor = reports_col.find({
        "user_id": user_id,
        "created_at": {"$gte": start_of_today},
    })
    docs = await cursor.to_list(length=1000)

    stats: Dict[str, int] = {"total": 0, "high": 0, "medium": 0, "low": 0}
    for doc in docs:
        sev = doc.get("severity", "low")
        if sev in stats:
            stats[sev] += 1

    # Total scanned today from scan_logs
    scanned_today = await scan_logs_col.count_documents({
        "user_id": user_id,
        "scanned_at": {"$gte": start_of_today},
    })
    stats["total"] = scanned_today

    return stats


# ── List all reports ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[Report])
async def list_reports(current_user=Depends(get_current_user)):
    cursor = reports_col.find(
        {"user_id": str(current_user["_id"])},
        sort=[("created_at", -1)],
    )
    docs = await cursor.to_list(length=100)
    return [_doc_to_report(d) for d in docs]


# ── Generate report (POST) ────────────────────────────────────────────────────

@router.post("/generate")
async def generate_report(
    payload: Dict[str, Any] = Body(...),
    current_user=Depends(get_current_user),
):
    """
    Generate individual AI strategic reports, one per competitor.

    Body:
      template         : "competitor_profile" | "market_deep_dive" | "custom"
      competitor_ids   : list of competitor ids (empty = all active for current user)
      sections         : list of section filters (optional)
    """
    user_id = str(current_user["_id"])
    template = payload.get("template", "market_deep_dive")
    competitor_ids: List[str] = payload.get("competitor_ids", [])
    sections: List[str] = payload.get("sections", [])

    # ── Resolve competitors ──────────────────────────────────────────────────
    if competitor_ids:
        try:
            oids = [ObjectId(cid) for cid in competitor_ids]
        except Exception:
            raise HTTPException(status_code=422, detail="Invalid competitor_id format")
        cursor = competitors_col.find({"_id": {"$in": oids}, "user_id": user_id})
    else:
        cursor = competitors_col.find({"user_id": user_id, "status": "active"})

    competitors = await cursor.to_list(length=50)
    if not competitors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No competitors found. Add competitors first.",
        )

    # ── Fetch last 7 days of signals per competitor ──────────────────────────
    week_ago = datetime.utcnow() - timedelta(days=7)
    comp_ids = [str(c["_id"]) for c in competitors]

    signals_cursor = signals_col.find({
        "user_id": user_id,
        "competitor_id": {"$in": comp_ids},
        "detected_at": {"$gte": week_ago},
    }, sort=[("detected_at", -1)])
    recent_signals = await signals_cursor.to_list(length=500)

    # Group signals by competitor
    sig_map: Dict[str, List[dict]] = {cid: [] for cid in comp_ids}
    for s in recent_signals:
        cid = s["competitor_id"]
        if cid in sig_map:
            sig_map[cid].append(s)

    # ── Generate one report per competitor ───────────────────────────────────
    generated_reports = []

    for comp in competitors:
        cid = str(comp["_id"])
        comp_sigs = sig_map.get(cid, [])

        # Build competitor-specific data payload for AI
        pricing = [s["description"] for s in comp_sigs if s.get("type") == "pricing"]
        hiring  = [s["description"] for s in comp_sigs if s.get("type") == "hiring"]
        tech    = [s["description"] for s in comp_sigs if s.get("type") in ("tech", "launch")]
        acq     = [s["description"] for s in comp_sigs if s.get("type") == "acquisition"]
        other   = [s["description"] for s in comp_sigs if s.get("type") == "web_update"]

        entry: Dict[str, Any] = {
            "name": comp["name"],
            "url": str(comp.get("url", "")),
            "risk_score": comp.get("risk_score", 0),
            "pricing_changes": pricing[:5],
            "hiring_signals": hiring[:5],
            "tech_signals": tech[:5],
            "acquisition_signals": acq[:5],
            "messaging_updates": other[:5],
            "total_signals_7d": len(comp_sigs),
        }

        if sections:
            entry = {k: v for k, v in entry.items() if k in ("name", "url", "risk_score") or any(s in k for s in sections)}

        # Call AI for this single competitor
        ai_result = await generate_strategic_report(template, [entry])

        executive_summary   = ai_result.get("executive_summary", "")
        strategic_insights  = ai_result.get("strategic_insights", [])
        recommendations     = ai_result.get("recommended_actions", [])
        overall_risk        = ai_result.get("overall_risk_level", "low")
        competitor_insights = ai_result.get("competitor_insights", [])
        market_trend        = ai_result.get("market_trend", "")

        ai_summary_text = (
            f"{executive_summary}\n\n"
            f"Market Trend: {market_trend}\n\n"
            f"Strategic Insights: {'; '.join(strategic_insights)}\n\n"
            f"Recommended Actions: {'; '.join(recommendations)}"
        )

        report_doc = {
            "competitor_id": cid,
            "competitor_name": comp["name"],
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "diffs": [],
            "ai_summary": ai_summary_text,
            "severity": overall_risk,
            "report_type": template,
            "competitors_included": [comp["name"]],
            "executive_summary": executive_summary,
            "strategic_insights": strategic_insights,
            "recommendations": recommendations,
            "competitor_insights": competitor_insights,
            "market_trend": market_trend,
            "overall_risk_level": overall_risk,
            "notified": False,
            "read": False,
        }
        result = await reports_col.insert_one(report_doc)
        generated_reports.append({
            "report_id": str(result.inserted_id),
            "competitor_name": comp["name"],
            "overall_risk_level": overall_risk,
            "executive_summary": executive_summary,
        })

    return {
        "generated": len(generated_reports),
        "reports": generated_reports,
        "template": template,
    }




# ── Get single report ─────────────────────────────────────────────────────────

@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str, current_user=Depends(get_current_user)):
    doc = await reports_col.find_one(
        {"_id": ObjectId(report_id), "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _doc_to_report(doc)


# ── Mark single report read ───────────────────────────────────────────────────

@router.patch("/{report_id}/read", response_model=Report)
async def mark_report_read(report_id: str, current_user=Depends(get_current_user)):
    doc = await reports_col.find_one_and_update(
        {"_id": ObjectId(report_id), "user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _doc_to_report(doc)


# ── Mark all reports read ─────────────────────────────────────────────────────

@router.patch("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_reports_read(current_user=Depends(get_current_user)):
    await reports_col.update_many(
        {"user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
    )
    return None


# ── Trigger n8n Agent ─────────────────────────────────────────────────────────

@router.post("/trigger-agent", status_code=status.HTTP_200_OK)
async def trigger_agent_manually(
    payload: Dict[str, Any] = Body(...),
    current_user=Depends(get_current_user),
):
    """
    Manually trigger the n8n agent workflow from the dashboard.
    """
    action = payload.get("action", "manual_trigger")
    data = payload.get("data", {})
    
    # Inject user info
    data["user_email"] = current_user.get("email")
    
    success = await trigger_n8n_agent(action, data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger the n8n agent. Make sure the webhook URL is configured.",
        )
        
    return {"ok": True, "message": f"Agent triggered successfully for '{action}'"}

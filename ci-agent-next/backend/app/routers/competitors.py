from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import competitors_col
from app.middleware.auth import get_current_user
from app.models.competitor import CompetitorCreate, CompetitorOut


router = APIRouter(prefix="/competitors", tags=["competitors"])


def _doc_to_out(doc: dict) -> CompetitorOut:
    return CompetitorOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        name=doc["name"],
        url=doc["url"],
        watch_sections=doc.get("watch_sections", []),
        notify_email=doc.get("notify_email", True),
        notify_slack=doc.get("notify_slack", True),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        last_scraped=doc.get("last_scraped"),
        status=doc.get("status", "active"),
    )


@router.get("/", response_model=list[CompetitorOut])
async def list_competitors(current_user=Depends(get_current_user)):
    cursor = competitors_col.find({"user_id": str(current_user["_id"])})
    docs = await cursor.to_list(length=100)
    return [_doc_to_out(d) for d in docs]


@router.get("/{competitor_id}", response_model=CompetitorOut)
async def get_competitor(competitor_id: str, current_user=Depends(get_current_user)):
    doc = await competitors_col.find_one(
        {"_id": ObjectId(competitor_id), "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _doc_to_out(doc)


@router.post("/", response_model=CompetitorOut, status_code=status.HTTP_201_CREATED)
async def create_competitor(
    payload: CompetitorCreate, current_user=Depends(get_current_user)
):
    doc = {
        **payload.model_dump(mode="json"),
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "status": "active",
        "last_scraped": None,
    }
    result = await competitors_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_out(doc)


@router.patch("/{competitor_id}")
async def update_competitor(
    competitor_id: str, data: dict, current_user=Depends(get_current_user)
):
    allowed = {"name", "watch_sections", "notify_email", "notify_slack", "status", "tags"}
    update_data = {k: v for k, v in data.items() if k in allowed}

    result = await competitors_col.update_one(
        {"_id": ObjectId(competitor_id), "user_id": str(current_user["_id"])},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return {"ok": True}


@router.delete("/{competitor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_competitor(competitor_id: str, current_user=Depends(get_current_user)):
    result = await competitors_col.delete_one(
        {"_id": ObjectId(competitor_id), "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


from fastapi import APIRouter, Depends

from app.database import alert_preferences_col
from app.middleware.auth import get_current_user
from app.models.alert_preference import AlertPreference, AlertPreferenceUpdate


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/preferences", response_model=AlertPreference)
async def get_preferences(current_user=Depends(get_current_user)):
    """Fetch the current user's alert preferences. Creates defaults if none exist."""
    user_id = str(current_user["_id"])
    doc = await alert_preferences_col.find_one({"user_id": user_id})
    if not doc:
        # Return sensible defaults without writing to DB yet
        return AlertPreference(user_id=user_id)
    return AlertPreference(
        user_id=doc["user_id"],
        notify_on_high=doc.get("notify_on_high", True),
        notify_on_medium=doc.get("notify_on_medium", True),
        notify_on_low=doc.get("notify_on_low", False),
        delivery_methods=doc.get("delivery_methods", ["email"]),
    )


@router.put("/preferences", response_model=AlertPreference)
async def update_preferences(
    payload: AlertPreferenceUpdate,
    current_user=Depends(get_current_user),
):
    """Create or update the authenticated user's alert preferences."""
    user_id = str(current_user["_id"])
    update = {k: v for k, v in payload.model_dump().items() if v is not None}

    if not update:
        # Nothing to change — return current
        return await get_preferences(current_user)

    await alert_preferences_col.update_one(
        {"user_id": user_id},
        {"$set": update},
        upsert=True,
    )
    doc = await alert_preferences_col.find_one({"user_id": user_id})
    return AlertPreference(
        user_id=user_id,
        notify_on_high=doc.get("notify_on_high", True),
        notify_on_medium=doc.get("notify_on_medium", True),
        notify_on_low=doc.get("notify_on_low", False),
        delivery_methods=doc.get("delivery_methods", ["email"]),
    )

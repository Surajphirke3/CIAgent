from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/test")
async def test_notifications(current_user=Depends(get_current_user)):
    # Simple stub endpoint to verify auth and wiring from the frontend.
    return {"ok": True, "email": current_user.get("email")}


from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.database import users_col
from app.middleware.auth import get_current_user
from app.models.user import TokenResponse, UserCreate, UserOut, UserUpdate, UserPreferencesUpdate, UserPreferences, ForgotPasswordRequest, ResetPasswordRequest
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token, decode_token
from app.utils.email import send_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


def _doc_to_user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name"),
        last_name=doc.get("last_name"),
        role=doc.get("role"),
        bio=doc.get("bio"),
        preferences=UserPreferences(**doc.get("preferences", {})),
        created_at=doc["created_at"],
        last_login=doc.get("last_login"),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    existing = await users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    doc = {
        "email": payload.email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.utcnow(),
    }
    result = await users_col.insert_one(doc)
    access_token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_col.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    # Stamp last_login timestamp
    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    access_token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return _doc_to_user_out(current_user)


@router.patch("/me", response_model=UserOut)
async def update_me(payload: UserUpdate, current_user=Depends(get_current_user)):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        return _doc_to_user_out(current_user)

    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await users_col.find_one({"_id": current_user["_id"]})
    return _doc_to_user_out(updated_user)


@router.patch("/preferences", response_model=UserOut)
async def update_preferences(payload: UserPreferencesUpdate, current_user=Depends(get_current_user)):
    update_data = {f"preferences.{k}": v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        return _doc_to_user_out(current_user)

    await users_col.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await users_col.find_one({"_id": current_user["_id"]})
    return _doc_to_user_out(updated_user)


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await users_col.find_one({"email": request.email})
    if not user:
        # Prevent email enumeration by always returning 200
        return {"message": "If that email exists, a reset link has been sent."}

    # Generate a temporary reset token leveraging our existing JWT logic
    reset_token = create_access_token(str(user["_id"]))
    
    # Send email async in background task (for speed, we just await it here, but ideally BackgroundTasks is used)
    await send_reset_email(user["email"], reset_token)
    
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        user_id = decode_token(request.token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    hashed_password = hash_password(request.new_password)
    
    await users_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": hashed_password}}
    )
    
    return {"message": "Password has been successfully reset."}

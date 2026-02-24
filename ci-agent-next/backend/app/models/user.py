from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserPreferences(BaseModel):
    email_alerts: bool = True
    push_notifications: bool = False
    weekly_digest: bool = True
    dark_mode: bool = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None


class UserPreferencesUpdate(BaseModel):
    email_alerts: Optional[bool] = None
    push_notifications: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    dark_mode: Optional[bool] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    preferences: UserPreferences
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"



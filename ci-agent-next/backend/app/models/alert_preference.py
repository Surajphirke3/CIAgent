from typing import List, Optional

from pydantic import BaseModel


class AlertPreference(BaseModel):
    user_id: str
    notify_on_high: bool = True
    notify_on_medium: bool = True
    notify_on_low: bool = False
    delivery_methods: List[str] = ["email"]   # ["email", "slack"]


class AlertPreferenceUpdate(BaseModel):
    notify_on_high: Optional[bool] = None
    notify_on_medium: Optional[bool] = None
    notify_on_low: Optional[bool] = None
    delivery_methods: Optional[List[str]] = None

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.report import DiffItem


SIGNAL_TYPES = ("pricing", "hiring", "tech", "acquisition", "launch", "web_update")
IMPACT_LEVELS = ("high", "medium", "low")


class Signal(BaseModel):
    id: str
    competitor_id: str
    competitor_name: str
    user_id: str
    type: str             # pricing | hiring | tech | acquisition | launch | web_update
    impact_level: str     # high | medium | low
    risk_score: int       # 0-100
    description: str
    diffs: List[DiffItem]
    detected_at: datetime
    read: bool = False


class SignalStats(BaseModel):
    high: int
    medium: int
    low: int
    scanned_today: int

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ScrapeJob(BaseModel):
    id: str
    competitor_id: str
    user_id: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: str  # running | completed | failed
    error: Optional[str] = None



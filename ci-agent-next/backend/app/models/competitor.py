from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class CompetitorCreate(BaseModel):
    name: str
    url: HttpUrl
    watch_sections: List[str] = ["pricing", "homepage", "blog", "jobs"]
    notify_email: bool = True
    notify_slack: bool = True
    tags: List[str] = []


class CompetitorOut(CompetitorCreate):
    id: str
    user_id: str
    created_at: datetime
    last_scraped: Optional[datetime] = None
    status: str = "active"  # active | paused



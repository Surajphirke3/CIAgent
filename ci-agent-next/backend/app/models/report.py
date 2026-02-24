from datetime import datetime
from typing import List

from pydantic import BaseModel


class DiffItem(BaseModel):
    section: str
    old_content: str
    new_content: str
    change_type: str  # added | removed | modified


class Report(BaseModel):
    id: str
    competitor_id: str
    competitor_name: str
    user_id: str
    created_at: datetime
    diffs: List[DiffItem]
    ai_summary: str
    severity: str  # low | medium | high
    notified: bool = False
    read: bool = False



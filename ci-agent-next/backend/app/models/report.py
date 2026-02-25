from datetime import datetime
from typing import List

from pydantic import BaseModel


class DiffItem(BaseModel):
    section: str
    old_content: str
    new_content: str
    change_type: str  # added | removed | modified


class CompetitorInsight(BaseModel):
    name: str
    key_changes: List[str]
    strategic_implications: str
    risk_level: str


class Report(BaseModel):
    id: str
    competitor_id: str
    competitor_name: str
    user_id: str
    created_at: datetime
    diffs: List[DiffItem]
    ai_summary: str
    severity: str  # low | medium | high
    
    # AI Enriched Strategic Fields
    report_type: str = "competitor_profile"
    competitors_included: List[str] = []
    executive_summary: str = ""
    strategic_insights: List[str] = []
    recommendations: List[str] = []
    market_trend: str = ""
    competitor_insights: List[CompetitorInsight] = []
    overall_risk_level: str = "low"

    notified: bool = False
    read: bool = False



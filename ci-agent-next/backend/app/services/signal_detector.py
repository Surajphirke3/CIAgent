"""
Signal Detection Engine
-----------------------
Classifies competitor change diffs into typed signals with impact levels
and risk scores, as defined in the CIAgent spec.
"""
from typing import List, Tuple

from app.models.report import DiffItem


# ── Keyword sets ─────────────────────────────────────────────────────────────
PRICING_KW = {"price", "pricing", "plan", "tier", "cost", "subscription", "fee",
               "billing", "per seat", "enterprise", "upgrade", "discount"}
HIRING_KW  = {"hiring", "job", "career", "open role", "vacancy", "engineer",
               "head of", "vp of", "director", "recruit", "talent", "apply now"}
TECH_KW    = {"patent", "api", "sdk", "feature", "integration", "open source",
               "github", "infrastructure", "data center", "technology", "tech stack"}
ACQ_KW     = {"acqui", "merger", "acquis", "acquired", "partnership", "strategic",
               "investor", "funding", "series", "ipo"}
LAUNCH_KW  = {"launch", "release", "unveil", "announce", "new product", "beta",
               "preview", "general availability", "ga", "going live"}

AI_HIRING_KW   = {"ai engineer", "ml engineer", "llm", "machine learning", "data scientist",
                   "nlp", "artificial intelligence"}
ENT_HIRING_KW  = {"vp of sales", "head of sales", "enterprise", "account executive", "cto", "cso"}


def _text(diffs: List[DiffItem]) -> str:
    """Flatten all diff content into a single lowercase string."""
    parts = []
    for d in diffs:
        parts.append(d.old_content.lower())
        parts.append(d.new_content.lower())
    return " ".join(parts)


def classify_signal(diffs: List[DiffItem], ai_summary: str) -> Tuple[str, str]:
    """
    Returns (signal_type, impact_level).

    signal_type  : pricing | hiring | tech | acquisition | launch | web_update
    impact_level : high | medium | low
    """
    combined = _text(diffs) + " " + ai_summary.lower()

    def hit(kw_set):
        return any(k in combined for k in kw_set)

    if hit(ACQ_KW):
        return "acquisition", "high"
    if hit(PRICING_KW):
        return "pricing", "high"
    if hit(LAUNCH_KW):
        return "launch", "medium"
    if hit(AI_HIRING_KW):
        return "hiring", "medium"
    if hit(HIRING_KW):
        return "hiring", "medium"
    if hit(TECH_KW):
        return "tech", "medium"
    return "web_update", "low"


def calculate_risk_score(diffs: List[DiffItem], ai_summary: str) -> int:
    """
    Risk score 0–100 based on the CIAgent spec formula:
      (pricingChange × 10) + (enterpriseHiring × 8) + (aiHiring × 9) + (acquisition × 10)
    Normalised to 0–100.
    """
    combined = _text(diffs) + " " + ai_summary.lower()

    def hit(kw_set):
        return any(k in combined for k in kw_set)

    raw = 0
    if hit(PRICING_KW):
        raw += 10
    if hit(ENT_HIRING_KW):
        raw += 8
    if hit(AI_HIRING_KW):
        raw += 9
    if hit(ACQ_KW):
        raw += 10
    if hit(LAUNCH_KW):
        raw += 6
    if hit(TECH_KW):
        raw += 4

    # Each diff section adds marginal weight
    raw += min(len(diffs) * 2, 20)

    return min(raw * 2, 100)   # scale: max raw=47 → normalise ×2 → cap 100

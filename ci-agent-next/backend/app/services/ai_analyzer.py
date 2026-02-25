"""
AI Analyzer — Groq LLaMA-powered competitor intelligence.
Includes retry logic, schema validation, and graceful fallback.
"""
import json
import logging
from typing import Any, Dict, List, Literal, Tuple

from groq import Groq
from pydantic import BaseModel, ValidationError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import settings
from app.models.report import DiffItem

logger = logging.getLogger(__name__)
client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = "You are a competitive intelligence analyst. Always respond in valid JSON only."

# ── Pydantic schemas for LLM response validation ──────────────────────────────

class SignalAnalysisResult(BaseModel):
    summary: str
    signals: List[str]
    actions: List[str]
    severity: Literal["low", "medium", "high"]


class CompetitorInsight(BaseModel):
    name: str
    key_changes: List[str]
    strategic_implications: str
    risk_level: Literal["low", "medium", "high"]


class StrategicReportResult(BaseModel):
    executive_summary: str
    competitor_insights: List[CompetitorInsight]
    strategic_insights: List[str]
    recommended_actions: List[str]
    overall_risk_level: Literal["low", "medium", "high"]
    market_trend: str


# ── Prompt templates ─────────────────────────────────────────────────────────

SIGNAL_ANALYSIS_PROMPT = """
Competitor: {competitor_name}
Changes detected on their website:

{changes}

Respond ONLY with this JSON (no markdown, no extra text):
{{
  "summary": "2-3 sentence executive summary of what changed and why it matters",
  "signals": ["strategic signal 1", "strategic signal 2"],
  "actions": ["recommended action 1", "recommended action 2"],
  "severity": "low|medium|high"
}}

Severity guide:
- high: pricing changes, new product launch, major feature addition, acquisition
- medium: significant content rewrite, new job postings in key areas, partnerships, tech updates
- low: minor copy updates, blog posts, small UI changes
"""

STRATEGIC_REPORT_PROMPT = """
Act as a strategic intelligence analyst. You have been given structured competitor intelligence data.

Template: {template}
Competitors analysed: {competitor_names}

Intelligence Data:
{intelligence_data}

Respond ONLY with this JSON (no markdown, no extra text):
{{
  "executive_summary": "3-4 sentence overall market summary",
  "competitor_insights": [
    {{
      "name": "CompetitorName",
      "key_changes": ["change 1", "change 2"],
      "strategic_implications": "What this means for the market",
      "risk_level": "low|medium|high"
    }}
  ],
  "strategic_insights": ["insight 1", "insight 2", "insight 3"],
  "recommended_actions": ["action 1", "action 2", "action 3"],
  "overall_risk_level": "low|medium|high",
  "market_trend": "1-2 sentence trend summary"
}}
"""


# ── Internal LLM call with retry ──────────────────────────────────────────────

@retry(
    retry=retry_if_exception_type(Exception),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=30),
    reraise=False,
)
async def _call_groq(messages: list, max_tokens: int = 1024) -> str | None:
    """Call Groq API with automatic retry on failure. Returns raw JSON string or None."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.3,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content
    except Exception as exc:
        logger.warning("Groq API call failed: %s — retrying...", exc)
        raise  # allow tenacity to retry


# ── Public API ────────────────────────────────────────────────────────────────

async def analyze_changes(
    competitor_name: str, diffs: List[DiffItem]
) -> Tuple[str, str]:
    """Analyze diffs and return (ai_summary, severity). Never raises."""
    if not diffs:
        return "No significant changes detected.", "low"

    changes_text = "\n\n".join(
        f"[{d.section.upper()} — {d.change_type.upper()}]\n"
        f"Before: {d.old_content[:400]}\n"
        f"After:  {d.new_content[:400]}"
        for d in diffs
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": SIGNAL_ANALYSIS_PROMPT.format(
                competitor_name=competitor_name, changes=changes_text
            ),
        },
    ]

    try:
        raw_content = await _call_groq(messages, max_tokens=1024)
    except Exception as exc:
        logger.error("Groq call failed repeatedly: %s", exc)
        raw_content = None

    if not raw_content:
        logger.error("Groq returned no content for %s after retries — using fallback.", competitor_name)
        return f"Automated analysis unavailable for {competitor_name}.", "low"

    try:
        raw = json.loads(raw_content)
        result = SignalAnalysisResult(**raw)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.error("AI response validation failed for %s: %s", competitor_name, exc)
        # Graceful fallback: extract whatever we got
        summary = raw_content[:500] if isinstance(raw_content, str) else "Analysis parsing failed."
        return summary, "low"

    summary = (
        f"{result.summary}\n\n"
        f"Signals: {', '.join(result.signals)}\n\n"
        f"Recommended Actions: {', '.join(result.actions)}"
    )
    return summary, result.severity


async def generate_strategic_report(
    template: str,
    competitors_data: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Generate a full AI strategic report. Never raises — returns fallback dict on failure."""
    _fallback = {
        "executive_summary": "AI analysis could not be completed. Please try again.",
        "competitor_insights": [],
        "strategic_insights": [],
        "recommended_actions": [],
        "overall_risk_level": "low",
        "market_trend": "Insufficient data.",
    }

    if not competitors_data:
        return _fallback

    competitor_names = ", ".join(c["name"] for c in competitors_data)
    intelligence_data = json.dumps(competitors_data, indent=2, default=str)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": STRATEGIC_REPORT_PROMPT.format(
                template=template,
                competitor_names=competitor_names,
                intelligence_data=intelligence_data[:6000],
            ),
        },
    ]

    try:
        raw_content = await _call_groq(messages, max_tokens=2048)
    except Exception as exc:
        logger.error("Groq call failed repeatedly for strategic report: %s", exc)
        raw_content = None

    if not raw_content:
        logger.error("Groq returned no content for strategic report after retries.")
        return _fallback

    try:
        raw = json.loads(raw_content)
        result = StrategicReportResult(**raw)
        return result.model_dump()
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.error("Strategic report AI response validation failed: %s", exc)
        return _fallback

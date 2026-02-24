import json
from typing import List, Tuple

from groq import Groq

from app.config import settings
from app.models.report import DiffItem


client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = "You are a competitive intelligence analyst. Always respond in valid JSON only."

USER_PROMPT = """
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
- high: pricing changes, new product launch, major feature addition
- medium: significant content rewrite, new job postings in key areas, partnerships
- low: minor copy updates, blog posts, small UI changes
"""


async def analyze_changes(
    competitor_name: str, diffs: List[DiffItem]
) -> Tuple[str, str]:
    if not diffs:
        return "No significant changes detected.", "low"

    changes_text = "\n\n".join(
        [
            (
                f"[{d.section.upper()} — {d.change_type.upper()}]\n"
                f"Before: {d.old_content[:400]}\n"
                f"After:  {d.new_content[:400]}"
            )
            for d in diffs
        ]
    )

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": USER_PROMPT.format(
                    competitor_name=competitor_name, changes=changes_text
                ),
            },
        ],
        temperature=0.3,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)

    summary = (
        f"{result['summary']}\n\n"
        f"Signals: {', '.join(result.get('signals', []))}\n\n"
        f"Recommended Actions: {', '.join(result.get('actions', []))}"
    )

    return summary, result.get("severity", "low")


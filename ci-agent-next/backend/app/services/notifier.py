"""
Notification service — sends email and Slack alerts.
All I/O is async to avoid blocking the FastAPI event loop.
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
import httpx

from app.config import settings
from app.models.report import Report

logger = logging.getLogger(__name__)


# ── Email ─────────────────────────────────────────────────────────────────────

async def send_email_alert(to_email: str, report: Report) -> bool:
    """Send an HTML email alert. Returns True on success, False on failure."""
    severity_color = {
        "high": "#DC2626",
        "medium": "#EA580C",
        "low": "#CA8A04",
    }.get(report.severity, "#6B7280")

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: {severity_color}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">CI Alert: {report.competitor_name}</h2>
        <p style="margin: 4px 0 0;">Severity: {report.severity.upper()}</p>
      </div>
      <div style="background: #F9FAFB; padding: 24px; border: 1px solid #E5E7EB; border-radius: 0 0 8px 8px;">
        <p><strong>Sections changed:</strong> {', '.join(d.section for d in report.diffs)}</p>
        <hr style="border-color: #E5E7EB;">
        <h3>AI Summary</h3>
        <p style="white-space: pre-line;">{report.ai_summary}</p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[CI Alert] {report.severity.upper()} — {report.competitor_name} changed"
    msg["From"] = settings.gmail_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=465,
            use_tls=True,
            username=settings.gmail_user,
            password=settings.gmail_app_password,
            timeout=15,
        )
        logger.info("Email alert sent to %s for competitor %s", to_email, report.competitor_name)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Email alert FAILED for %s (competitor: %s): %s",
            to_email, report.competitor_name, exc
        )
        # Fallback to Slack if email fails
        logger.info("Falling back to Slack alert for %s", report.competitor_name)
        return await send_slack_alert(report)


# ── Slack ─────────────────────────────────────────────────────────────────────

async def send_slack_alert(report: Report) -> bool:
    """Post a Slack block-kit alert. Returns True on success, False on failure."""
    if not settings.slack_webhook_url:
        logger.warning("Slack webhook not configured — skipping Slack alert.")
        return False

    emoji = {"high": "🔴", "medium": "🟠", "low": "🟡"}.get(report.severity, "⚪")
    sections_changed = ", ".join(d.section for d in report.diffs)

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"{emoji} {report.competitor_name} — {report.severity.upper()}",
                },
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Sections:*\n{sections_changed}"},
                    {"type": "mrkdwn", "text": f"*Changes:*\n{len(report.diffs)} section(s)"},
                ],
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": report.ai_summary[:500]},
            },
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(settings.slack_webhook_url, json=payload)
            resp.raise_for_status()
        logger.info("Slack alert sent for competitor %s", report.competitor_name)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Slack alert FAILED for %s: %s", report.competitor_name, exc)
        return False


# ── Weekly Digest ─────────────────────────────────────────────────────────────

async def send_weekly_digest(to_email: str, competitor_summaries: list[dict]) -> bool:
    """Send a weekly digest email summarizing all competitor activity."""
    if not competitor_summaries:
        logger.info("No activity for weekly digest — skipping email to %s", to_email)
        return True

    rows = "".join(
        f"""
        <tr>
          <td style="padding:8px;border-bottom:1px solid #E5E7EB;">{s['name']}</td>
          <td style="padding:8px;border-bottom:1px solid #E5E7EB;">{s['signal_count']}</td>
          <td style="padding:8px;border-bottom:1px solid #E5E7EB;">{s['top_type']}</td>
          <td style="padding:8px;border-bottom:1px solid #E5E7EB;color:{'#DC2626' if s['risk_score']>=70 else '#EA580C' if s['risk_score']>=40 else '#CA8A04'};">{s['risk_score']}</td>
        </tr>
        """
        for s in competitor_summaries
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
      <div style="background:#1E293B;color:white;padding:24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">CIAgent Weekly Intelligence Digest</h2>
        <p style="color:#94A3B8;margin:4px 0 0;">Your competitor activity summary for the past 7 days.</p>
      </div>
      <div style="padding:24px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#F1F5F9;">
              <th style="padding:10px;text-align:left;">Competitor</th>
              <th style="padding:10px;text-align:left;">Signals</th>
              <th style="padding:10px;text-align:left;">Top Signal</th>
              <th style="padding:10px;text-align:left;">Risk Score</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "CIAgent Weekly Intelligence Digest"
    msg["From"] = settings.gmail_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=465,
            use_tls=True,
            username=settings.gmail_user,
            password=settings.gmail_app_password,
            timeout=15,
        )
        logger.info("Weekly digest sent to %s", to_email)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Weekly digest FAILED for %s: %s", to_email, exc)
        return False

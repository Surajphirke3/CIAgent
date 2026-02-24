import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from app.config import settings
from app.models.report import Report


async def send_email_alert(to_email: str, report: Report):
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

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.gmail_user, settings.gmail_app_password)
        server.sendmail(settings.gmail_user, to_email, msg.as_string())


async def send_slack_alert(report: Report):
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
                    {
                        "type": "mrkdwn",
                        "text": f"*Changes:*\n{len(report.diffs)} section(s)",
                    },
                ],
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": report.ai_summary[:500]},
            },
        ]
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(settings.slack_webhook_url, json=payload, timeout=10)
        resp.raise_for_status()


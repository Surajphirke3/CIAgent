import aiosmtplib
from email.message import EmailMessage

from app.config import settings

async def send_reset_email(to_email: str, reset_token: str):
    """
    Sends an async email with the forgot password link.
    Relies on Gmail SMTP using app passwords.
    """
    reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"
    
    message = EmailMessage()
    message["From"] = settings.gmail_user
    message["To"] = to_email
    message["Subject"] = "CIAgent: Reset Your Password"
    
    html_content = f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for CIAgent.</p>
        <p>Click the link below to set a new password:</p>
        <a href="{reset_link}">{reset_link}</a>
        <br/><br/>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>The link will expire in 15 minutes.</p>
      </body>
    </html>
    """
    message.set_content(html_content, subtype="html")
    
    # Send email async
    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=465, # SSL port for Gmail
            use_tls=True,
            username=settings.gmail_user,
            password=settings.gmail_app_password,
        )
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        # In a real production app we'd log this properly

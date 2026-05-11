import os
from app.config import settings
from typing import Optional

async def send_welcome_email(email: str, full_name: str, role: str, agency_name: Optional[str] = None):
    subject = "Welcome to CareSync"
    if settings.email_provider == "resend" and settings.resend_api_key:
        import resend
        resend.api_key = settings.resend_api_key
        # For MVP, we'll send a simple email. In production, add a "set password" link.
        html_content = f"""
        <h1>Welcome {full_name}!</h1>
        <p>You've been added as a <strong>{role}</strong> to CareSync.</p>
        <p>Please contact your agency administrator to set your password.</p>
        <p>Best regards,<br>CareSync Team</p>
        """
        try:
            resend.Emails.send(
                from_=settings.email_from,
                to=email,
                subject=subject,
                html=html_content
            )
        except Exception as e:
            print(f"Email send failed: {e}")
    elif settings.email_provider == "sendgrid" and settings.sendgrid_api_key:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        message = Mail(
            from_email=settings.email_from,
            to_emails=email,
            subject=subject,
            html_content=f"<p>Welcome {full_name}! You've been added as a {role}.</p>"
        )
        try:
            sg = SendGridAPIClient(settings.sendgrid_api_key)
            sg.send(message)
        except Exception as e:
            print(f"SendGrid failed: {e}")
    else:
        print(f"Email provider not configured. Would send welcome email to {email}")
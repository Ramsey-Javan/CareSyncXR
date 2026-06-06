import logging
from app.config import settings

logger = logging.getLogger(__name__)

async def send_welcome_email(email: str, full_name: str, role: str, agency_name: str = None):
    subject = f"Welcome to CareSync, {full_name}!"
    
    # For development, if no API key, just log
    if settings.environment == "development" and not settings.resend_api_key and not settings.sendgrid_api_key:
        logger.info(f"[EMAIL MOCK] Would send welcome email to {email}")
        logger.info(f"Subject: {subject}")
        return True
    
    html_content = f"""
    <h1>Welcome {full_name}!</h1>
    <p>You've been added as a <strong>{role}</strong> to CareSync.</p>
    {f'<p>Agency: {agency_name}</p>' if agency_name else ''}
    <p>Please contact your agency administrator to set your password and log in.</p>
    <p>Best regards,<br>CareSync Team</p>
    """
    
    try:
        if settings.email_provider == "resend" and settings.resend_api_key:
            import resend
            resend.api_key = settings.resend_api_key
            # Correct API call for Resend Python SDK
            resend.Emails.send({
                "from": settings.email_from,
                "to": email,
                "subject": subject,
                "html": html_content
            })
            logger.info(f"Welcome email sent via Resend to {email}")
        elif settings.email_provider == "sendgrid" and settings.sendgrid_api_key:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            message = Mail(
                from_email=settings.email_from,
                to_emails=email,
                subject=subject,
                html_content=html_content
            )
            sg = SendGridAPIClient(settings.sendgrid_api_key)
            sg.send(message)
            logger.info(f"Welcome email sent via SendGrid to {email}")
        else:
            logger.warning(f"No email provider configured. Would send to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {e}")
        return False
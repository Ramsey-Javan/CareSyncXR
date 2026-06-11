# app/core/email.py
import logging
from app.config import settings

logger = logging.getLogger(__name__)


#  Internal send helper 
# All email functions delegate here so provider logic lives in one place.

async def _send(to: str, subject: str, html: str) -> bool:
    if settings.environment == "development" and not settings.resend_api_key and not settings.sendgrid_api_key:
        logger.info(f"[EMAIL MOCK] To: {to} | Subject: {subject}")
        return True
    try:
        if settings.email_provider == "resend" and settings.resend_api_key:
            import resend
            resend.api_key = settings.resend_api_key
            resend.Emails.send({
                "from": settings.email_from,
                "to": to,
                "subject": subject,
                "html": html,
            })
            logger.info(f"Email sent via Resend to {to}")
        elif settings.email_provider == "sendgrid" and settings.sendgrid_api_key:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            sg = SendGridAPIClient(settings.sendgrid_api_key)
            sg.send(Mail(
                from_email=settings.email_from,
                to_emails=to,
                subject=subject,
                html_content=html,
            ))
            logger.info(f"Email sent via SendGrid to {to}")
        else:
            logger.warning(f"No email provider configured. Would send to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


# Welcome email 

async def send_welcome_email(
    email: str, full_name: str, role: str, agency_name: str = None
) -> bool:
    subject = f"Welcome to CareSync, {full_name}!"
    html = f"""
    <h1>Welcome {full_name}!</h1>
    <p>You've been added as a <strong>{role}</strong> to CareSync.</p>
    {f'<p>Agency: {agency_name}</p>' if agency_name else ''}
    <p>Please contact your agency administrator to set your password and log in.</p>
    <p>Best regards,<br>CareSync Team</p>
    """
    return await _send(email, subject, html)


# ── Alert notification email (Week 4) ─────────────────────────────────────────

async def send_alert_email(
    to: str,
    recipient_name: str,
    patient_name: str,
    severity: str,
    message: str,
    alert_id: str,
) -> bool:
    colour_map = {
        "critical": "#DC2626",
        "warning":  "#D97706",
        "info":     "#2563EB",
    }
    badge_colour = colour_map.get(severity.lower(), "#6B7280")
    subject = f"[CareSync {severity.upper()}] Alert for {patient_name}"
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;">
      <h2 style="color:#0F6E56;">CareSync Alert</h2>
      <p>
        <span style="background:{badge_colour};color:#fff;padding:3px 10px;
                     border-radius:4px;font-weight:bold;font-size:13px;">
          {severity.upper()}
        </span>
      </p>
      <p>Hi {recipient_name},</p>
      <p>A <strong>{severity}</strong> alert has been raised for your patient
         <strong>{patient_name}</strong>:</p>
      <blockquote style="border-left:4px solid {badge_colour};
                          padding:8px 16px;color:#333;margin:16px 0;">
        {message}
      </blockquote>
      <p>Please log in to CareSync to review the reading and acknowledge this alert.</p>
      <p style="margin-top:24px;">
        <a href="{settings.frontend_url}/alerts/{alert_id}"
           style="background:#0F6E56;color:#fff;padding:10px 20px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          View Alert
        </a>
      </p>
      <hr style="margin-top:32px;border:none;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;">CareSync — Continuous healthcare beyond hospital walls</p>
    </div>
    """
    return await _send(to, subject, html)


# Missed check-in email 

async def send_missed_checkin_email(
    to: str,
    recipient_name: str,
    patient_name: str,
    hours_overdue: int,
) -> bool:
    subject = f"[CareSync WARNING] {patient_name} missed their health check-in"
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;">
      <h2 style="color:#0F6E56;">CareSync — Missed Check-in</h2>
      <p>Hi {recipient_name},</p>
      <p>Your patient <strong>{patient_name}</strong> has not logged any health
         readings in the past <strong>{hours_overdue} hours</strong>.</p>
      <p>Please follow up to ensure they are doing well.</p>
      <p style="margin-top:24px;">
        <a href="{settings.frontend_url}/patients"
           style="background:#0F6E56;color:#fff;padding:10px 20px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          View Patients
        </a>
      </p>
      <hr style="margin-top:32px;border:none;border-top:1px solid #eee;">
      <p style="color:#999;font-size:12px;">CareSync — Continuous healthcare beyond hospital walls</p>
    </div>
    """
    return await _send(to, subject, html)
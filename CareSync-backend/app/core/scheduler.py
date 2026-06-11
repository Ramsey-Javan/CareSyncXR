# app/core/scheduler.py
#
# APScheduler running inside the FastAPI process.
# Jobs defined here are started on app startup and stopped on shutdown.
#
# Current jobs:
#   missed_checkin_scan  — runs every hour
#                          scans all active patients, raises WARNING alerts
#                          and emails doctors/caregivers for anyone who hasn't
#                          logged vitals in settings.missed_checkin_hours
#
import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.alert import Alert, AlertSeverity
from app.models.health_reading import HealthReading
from app.models.patient import PatientProfile
from app.core.email import send_missed_checkin_email
from app.config import settings

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def missed_checkin_scan() -> None:
    """
    Scans every active patient.
    If their last health reading is older than settings.missed_checkin_hours,
    creates a WARNING alert and emails assigned doctors + caregivers.
    Skips patients who already have an unacknowledged missed check-in alert
    raised in the last 6 hours (prevents email spam).
    """
    logger.info("[Scheduler] Running missed check-in scan...")
    cutoff = datetime.utcnow() - timedelta(hours=settings.missed_checkin_hours)
    alerts_created = 0

    async with AsyncSessionLocal() as db:
        patients_result = await db.execute(
            select(PatientProfile)
            .where(PatientProfile.is_active == True)
            .options(
                selectinload(PatientProfile.doctors),
                selectinload(PatientProfile.caregivers),
                selectinload(PatientProfile.user),
            )
        )
        patients = patients_result.scalars().all()

        for patient in patients:
            # Last reading timestamp
            last_result = await db.execute(
                select(func.max(HealthReading.recorded_at))
                .where(HealthReading.patient_id == patient.id)
            )
            last_reading_at = last_result.scalar()

            # Still within the window — skip
            if last_reading_at is not None and last_reading_at >= cutoff:
                continue

            hours_overdue = (
                settings.missed_checkin_hours
                if last_reading_at is None
                else int((datetime.utcnow() - last_reading_at).total_seconds() / 3600)
            )

            # Skip if we already alerted in the last 6 hours
            recent = await db.execute(
                select(Alert).where(
                    Alert.patient_id == patient.id,
                    Alert.severity == AlertSeverity.WARNING,
                    Alert.message.like("Missed check-in%"),
                    Alert.created_at >= datetime.utcnow() - timedelta(hours=6),
                    Alert.acknowledged == False,
                )
            )
            if recent.scalar_one_or_none():
                continue

            patient_name = patient.user.full_name if patient.user else str(patient.id)

            alert = Alert(
                patient_id=patient.id,
                reading_id=None,
                severity=AlertSeverity.WARNING,
                message=f"Missed check-in: {patient_name} has not logged vitals in {hours_overdue}h",
            )
            db.add(alert)
            await db.flush()
            alerts_created += 1

            # Email doctors and caregivers
            for recipient in list(patient.doctors) + list(patient.caregivers):
                await send_missed_checkin_email(
                    to=recipient.email,
                    recipient_name=recipient.full_name,
                    patient_name=patient_name,
                    hours_overdue=hours_overdue,
                )

        await db.commit()

    logger.info(f"[Scheduler] Missed check-in scan complete — {alerts_created} alert(s) created.")


def start_scheduler() -> None:
    scheduler.add_job(
        missed_checkin_scan,
        trigger=IntervalTrigger(hours=1),
        id="missed_checkin_scan",
        name="Missed check-in scanner",
        replace_existing=True,
        next_run_time=datetime.utcnow(),  # run once immediately on startup too
    )
    scheduler.start()
    logger.info("[Scheduler] Started — missed check-in scan will run every hour.")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("[Scheduler] Stopped.")
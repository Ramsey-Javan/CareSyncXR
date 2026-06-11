# app/api/v1/alerts.py
#
# Week 4 — Alert System
# Endpoints:
#   GET  /alerts/                        — list alerts (filtered, paginated)
#   GET  /alerts/stats                   — counts by severity for dashboard
#   GET  /alerts/{alert_id}              — single alert detail
#   POST /alerts/{alert_id}/acknowledge  — mark acknowledged
#   POST /alerts/missed-checkins         — manually trigger missed check-in scan
#                                          (cron job calls this internally too)
#
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.alert import Alert, AlertSeverity
from app.models.patient import PatientProfile, patient_doctor, patient_caregiver
from app.models.health_reading import HealthReading
from app.models.user import User
from app.core.dependencies import get_current_user, require_admin
from app.core.email import send_alert_email, send_missed_checkin_email
from app.schemas.alert import AlertResponse, AlertStatsResponse, AcknowledgeRequest
from app.config import settings

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# Permission helper 

def _base_alert_query(current_user: User):
    """
    Returns a SELECT on Alert pre-filtered by what this user is allowed to see.
      super_admin  → all alerts
      admin        → all alerts within their agency
      doctor       → alerts for patients assigned to them
      caregiver    → alerts for patients assigned to them
      patient      → their own alerts only
    """
    query = select(Alert)

    if current_user.role == "super_admin":
        return query

    if current_user.role == "admin":
        # Join through patient → user to check agency
        query = (
            query
            .join(PatientProfile, Alert.patient_id == PatientProfile.id)
            .join(User, PatientProfile.user_id == User.id)
            .where(User.agency_id == current_user.agency_id)
        )
        return query

    if current_user.role == "doctor":
        query = (
            query
            .join(PatientProfile, Alert.patient_id == PatientProfile.id)
            .join(patient_doctor, patient_doctor.c.patient_id == PatientProfile.id)
            .where(patient_doctor.c.doctor_id == current_user.id)
        )
        return query

    if current_user.role == "caregiver":
        query = (
            query
            .join(PatientProfile, Alert.patient_id == PatientProfile.id)
            .join(patient_caregiver, patient_caregiver.c.patient_id == PatientProfile.id)
            .where(patient_caregiver.c.caregiver_id == current_user.id)
        )
        return query

    if current_user.role == "patient":
        query = (
            query
            .join(PatientProfile, Alert.patient_id == PatientProfile.id)
            .where(PatientProfile.user_id == current_user.id)
        )
        return query

    return query.where(False)  # unknown role — see nothing


#  Endpoints 

@router.get("/stats", response_model=AlertStatsResponse)
async def get_alert_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Counts used by the dashboard header:
      - total unacknowledged alerts
      - critical / warning / info breakdown
      - alerts raised in the last 24 hours
    """
    base = _base_alert_query(current_user).where(Alert.acknowledged == False)

    # Total unacknowledged
    total_result = await db.execute(
        base.with_only_columns(func.count()).order_by(None)
    )
    total = total_result.scalar() or 0

    # By severity
    for_critical = base.with_only_columns(func.count()).where(
        Alert.severity == AlertSeverity.CRITICAL
    ).order_by(None)
    for_warning = base.with_only_columns(func.count()).where(
        Alert.severity == AlertSeverity.WARNING
    ).order_by(None)
    for_info = base.with_only_columns(func.count()).where(
        Alert.severity == AlertSeverity.INFO
    ).order_by(None)

    critical = (await db.execute(for_critical)).scalar() or 0
    warning  = (await db.execute(for_warning)).scalar()  or 0
    info     = (await db.execute(for_info)).scalar()     or 0

    # Last 24 hours (any severity, acknowledged or not)
    since = datetime.utcnow() - timedelta(hours=24)
    today_base = _base_alert_query(current_user).where(Alert.created_at >= since)
    today_result = await db.execute(
        today_base.with_only_columns(func.count()).order_by(None)
    )
    today = today_result.scalar() or 0

    return AlertStatsResponse(
        total_unacknowledged=total,
        critical=critical,
        warning=warning,
        info=info,
        alerts_last_24h=today,
    )


@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    severity: Optional[str] = Query(None, description="critical | warning | info"),
    acknowledged: Optional[bool] = Query(None),
    patient_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List alerts with optional filters.
    Results ordered: CRITICAL first, then WARNING, then INFO, newest first within each.
    """
    query = _base_alert_query(current_user)

    if severity:
        try:
            sev_enum = AlertSeverity(severity.lower())
        except ValueError:
            raise HTTPException(400, f"Invalid severity '{severity}'. Use: critical, warning, info")
        query = query.where(Alert.severity == sev_enum)

    if acknowledged is not None:
        query = query.where(Alert.acknowledged == acknowledged)

    if patient_id:
        query = query.where(Alert.patient_id == patient_id)

    # Priority sort: CRITICAL → WARNING → INFO, then newest first
    severity_order = func.case(
        (Alert.severity == AlertSeverity.CRITICAL, 1),
        (Alert.severity == AlertSeverity.WARNING,  2),
        (Alert.severity == AlertSeverity.INFO,     3),
        else_=4,
    )
    query = query.order_by(severity_order, Alert.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an alert as acknowledged. Records who acknowledged it and when."""
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    if alert.acknowledged:
        raise HTTPException(400, "Alert already acknowledged")

    alert.acknowledged = True
    alert.acknowledged_by = current_user.id
    alert.acknowledged_at = datetime.utcnow()
    await db.commit()
    await db.refresh(alert)
    return alert


#  Missed check-in scanner 

@router.post("/missed-checkins", status_code=200)
async def scan_missed_checkins(
    background_tasks: BackgroundTasks,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Scans all active patients. For any patient whose last health reading
    is older than settings.missed_checkin_hours, creates a WARNING alert
    and emails their assigned doctor(s) and caregiver(s).

    Called by a cron job (e.g. APScheduler or Railway cron) every hour.
    Can also be triggered manually by an admin.
    """
    cutoff = datetime.utcnow() - timedelta(hours=settings.missed_checkin_hours)

    # Fetch all active patients with their last reading time
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

    alerts_created = 0

    for patient in patients:
        # Get last reading timestamp
        last_reading_result = await db.execute(
            select(func.max(HealthReading.recorded_at))
            .where(HealthReading.patient_id == patient.id)
        )
        last_reading_at = last_reading_result.scalar()

        # Patient has never logged OR hasn't logged recently
        if last_reading_at is None or last_reading_at < cutoff:
            hours_overdue = (
                settings.missed_checkin_hours
                if last_reading_at is None
                else int((datetime.utcnow() - last_reading_at).total_seconds() / 3600)
            )

            # Avoid duplicate alerts — check if one was already raised in last 6 hours
            recent_alert = await db.execute(
                select(Alert).where(
                    Alert.patient_id == patient.id,
                    Alert.severity == AlertSeverity.WARNING,
                    Alert.message.like("Missed check-in%"),
                    Alert.created_at >= datetime.utcnow() - timedelta(hours=6),
                    Alert.acknowledged == False,
                )
            )
            if recent_alert.scalar_one_or_none():
                continue  # already alerted recently

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

            # Email assigned doctors
            for doctor in patient.doctors:
                background_tasks.add_task(
                    send_missed_checkin_email,
                    to=doctor.email,
                    recipient_name=doctor.full_name,
                    patient_name=patient_name,
                    hours_overdue=hours_overdue,
                )

            # Email assigned caregivers
            for caregiver in patient.caregivers:
                background_tasks.add_task(
                    send_missed_checkin_email,
                    to=caregiver.email,
                    recipient_name=caregiver.full_name,
                    patient_name=patient_name,
                    hours_overdue=hours_overdue,
                )

    await db.commit()
    return {"alerts_created": alerts_created}
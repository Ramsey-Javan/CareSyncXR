# Used by the frontend
#   - Total patients count
#   - Alerts today count
#   - Consultations count
#   - Patient status breakdown (healthy / needs attention / critical)
#
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.alert import Alert, AlertSeverity
from app.models.consultation import Consultation, ConsultationStatus
from app.models.patient import PatientProfile, patient_doctor, patient_caregiver
from app.models.health_reading import HealthReading
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.dashboard import DashboardStatsResponse, PatientStatusCard

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Single endpoint that returns everything the dashboard header needs.
    Scoped to what the current user is allowed to see.
    """
    since_24h = datetime.utcnow() - timedelta(hours=24)

    # Build patient ID scope for this user 
    if current_user.role in ("super_admin", "admin"):
        # Admins see all patients in their agency
        patients_query = select(PatientProfile.id).where(PatientProfile.is_active == True)
        if current_user.role == "admin":
            patients_query = (
                patients_query
                .join(User, PatientProfile.user_id == User.id)
                .where(User.agency_id == current_user.agency_id)
            )
    elif current_user.role == "doctor":
        patients_query = (
            select(PatientProfile.id)
            .join(patient_doctor, patient_doctor.c.patient_id == PatientProfile.id)
            .where(patient_doctor.c.doctor_id == current_user.id)
            .where(PatientProfile.is_active == True)
        )
    elif current_user.role == "caregiver":
        patients_query = (
            select(PatientProfile.id)
            .join(patient_caregiver, patient_caregiver.c.patient_id == PatientProfile.id)
            .where(patient_caregiver.c.caregiver_id == current_user.id)
            .where(PatientProfile.is_active == True)
        )
    else:
        # Patient sees only themselves
        patients_query = (
            select(PatientProfile.id)
            .where(PatientProfile.user_id == current_user.id)
            .where(PatientProfile.is_active == True)
        )

    patient_ids_result = await db.execute(patients_query)
    patient_ids = [row[0] for row in patient_ids_result.all()]

    if not patient_ids:
        return DashboardStatsResponse(
            total_patients=0,
            alerts_today=0,
            critical_alerts=0,
            consultations_today=0,
            patient_status_cards=[],
        )

    total_patients = len(patient_ids)

    #  Alerts today 
    alerts_today_result = await db.execute(
        select(func.count())
        .where(
            Alert.patient_id.in_(patient_ids),
            Alert.created_at >= since_24h,
        )
    )
    alerts_today = alerts_today_result.scalar() or 0

    #  Critical unacknowledged alerts 
    critical_result = await db.execute(
        select(func.count())
        .where(
            Alert.patient_id.in_(patient_ids),
            Alert.severity == AlertSeverity.CRITICAL,
            Alert.acknowledged == False,
        )
    )
    critical_alerts = critical_result.scalar() or 0

    #  Consultations today 
    consults_result = await db.execute(
        select(func.count())
        .select_from(Consultation)
        .where(
            Consultation.patient_id.in_(patient_ids),
            Consultation.scheduled_at >= since_24h,
            Consultation.status.in_([
                ConsultationStatus.SCHEDULED,
                ConsultationStatus.ACTIVE,
                ConsultationStatus.COMPLETED,
            ]),
        )
    )
    consultations_today = consults_result.scalar() or 0

    # Patient status cards 
    # Status logic:
    #   critical       → has any unacknowledged CRITICAL alert
    #   needs_attention → has any unacknowledged WARNING alert, or no reading in 24h
    #   healthy        → everything else
    status_cards: list[PatientStatusCard] = []

    for pid in patient_ids:
        # Unacknowledged alerts for this patient
        unacked_result = await db.execute(
            select(Alert.severity)
            .where(Alert.patient_id == pid, Alert.acknowledged == False)
            .order_by(
                case(
                    (Alert.severity == AlertSeverity.CRITICAL, 1),
                    (Alert.severity == AlertSeverity.WARNING, 2),
                    else_=3,
                )
            )
            .limit(1)
        )
        worst_severity = unacked_result.scalar()

        # Last reading timestamp
        last_reading_result = await db.execute(
            select(func.max(HealthReading.recorded_at))
            .where(HealthReading.patient_id == pid)
        )
        last_reading_at = last_reading_result.scalar()

        if worst_severity == AlertSeverity.CRITICAL:
            status = "critical"
        elif worst_severity == AlertSeverity.WARNING:
            status = "needs_attention"
        elif last_reading_at is None or last_reading_at < since_24h:
            status = "needs_attention"
        else:
            status = "healthy"

        status_cards.append(PatientStatusCard(
            patient_id=pid,
            status=status,
            last_reading_at=last_reading_at,
        ))

    return DashboardStatsResponse(
        total_patients=total_patients,
        alerts_today=alerts_today,
        critical_alerts=critical_alerts,
        consultations_today=consultations_today,
        patient_status_cards=status_cards,
    )
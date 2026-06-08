import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.alert import Alert, AlertSeverity
from app.models.health_reading import HealthReading
from app.models.patient import PatientProfile, patient_caregiver, patient_doctor
from app.models.user import User
from app.schemas.health_reading import (
    HealthReadingCreate,
    HealthReadingResponse,
    LatestVitalsResponse,
    TrendPoint,
    TrendResponse,
)

router = APIRouter(prefix="/health-readings", tags=["Health Readings"])


async def _assert_can_access_patient(
    patient: PatientProfile,
    current_user: User,
    db: AsyncSession,
) -> None:
    if current_user.role in ("super_admin", "admin"):
        return

    if current_user.role == "doctor":
        result = await db.execute(
            select(patient_doctor.c.patient_id).where(
                patient_doctor.c.patient_id == patient.id,
                patient_doctor.c.doctor_id == current_user.id,
            )
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=403, detail="Not assigned to this patient")
        return

    if current_user.role == "caregiver":
        result = await db.execute(
            select(patient_caregiver.c.patient_id).where(
                patient_caregiver.c.patient_id == patient.id,
                patient_caregiver.c.caregiver_id == current_user.id,
            )
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=403, detail="Not assigned to this patient")
        return

    if current_user.role == "patient":
        if current_user.id != patient.user_id:
            raise HTTPException(status_code=403, detail="Cannot access another patient's data")
        return

    raise HTTPException(status_code=403, detail="Not authorized")


def _evaluate_alerts(reading: HealthReading) -> list[Alert]:
    alerts: list[Alert] = []

    def alert(severity: AlertSeverity, message: str) -> Alert:
        return Alert(
            patient_id=reading.patient_id,
            reading_id=reading.id,
            severity=severity,
            message=message,
        )

    if reading.systolic_bp is not None and reading.diastolic_bp is not None:
        systolic = reading.systolic_bp
        diastolic = reading.diastolic_bp
        if systolic > 180 or diastolic > 120:
            alerts.append(alert(AlertSeverity.CRITICAL, f"Hypertensive crisis: BP {systolic}/{diastolic} mmHg"))
        elif systolic > 140 or diastolic > 90:
            alerts.append(alert(AlertSeverity.WARNING, f"High blood pressure: {systolic}/{diastolic} mmHg"))
        elif systolic < 90 or diastolic < 60:
            alerts.append(alert(AlertSeverity.WARNING, f"Low blood pressure: {systolic}/{diastolic} mmHg"))

    if reading.glucose is not None:
        if reading.glucose > 200:
            alerts.append(alert(AlertSeverity.WARNING, f"High glucose: {reading.glucose} mg/dL"))
        elif reading.glucose < 70:
            alerts.append(alert(AlertSeverity.CRITICAL, f"Low glucose: {reading.glucose} mg/dL"))

    if reading.oxygen_saturation is not None and reading.oxygen_saturation < 92:
        alerts.append(alert(AlertSeverity.CRITICAL, f"Low oxygen saturation: {reading.oxygen_saturation}%"))

    if reading.heart_rate is not None:
        if reading.heart_rate > 120:
            alerts.append(alert(AlertSeverity.WARNING, f"High heart rate: {reading.heart_rate} bpm"))
        elif reading.heart_rate < 40:
            alerts.append(alert(AlertSeverity.CRITICAL, f"Dangerously low heart rate: {reading.heart_rate} bpm"))

    if reading.temperature is not None and reading.temperature > 38.5:
        alerts.append(alert(AlertSeverity.WARNING, f"Fever: {reading.temperature} C"))

    return alerts


async def _get_active_patient_or_404(patient_id: uuid.UUID, db: AsyncSession) -> PatientProfile:
    result = await db.execute(
        select(PatientProfile).where(
            PatientProfile.id == patient_id,
            PatientProfile.is_active == True,
        )
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", response_model=HealthReadingResponse, status_code=status.HTTP_201_CREATED)
async def log_reading(
    data: HealthReadingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    patient = await _get_active_patient_or_404(data.patient_id, db)
    await _assert_can_access_patient(patient, current_user, db)

    reading = HealthReading(
        patient_id=data.patient_id,
        recorded_by=current_user.id,
        recorded_at=data.recorded_at or datetime.utcnow(),
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        glucose=data.glucose,
        weight=data.weight,
        temperature=data.temperature,
        oxygen_saturation=data.oxygen_saturation,
        heart_rate=data.heart_rate,
        symptoms=data.symptoms,
        notes=data.notes,
        photo_url=data.photo_url,
    )
    db.add(reading)
    await db.flush()

    for triggered_alert in _evaluate_alerts(reading):
        db.add(triggered_alert)

    await db.commit()
    await db.refresh(reading)
    return reading


@router.post("/upload-photo", status_code=status.HTTP_200_OK)
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WebP.",
        )

    contents = await file.read()
    max_size_mb = 10
    if len(contents) > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {max_size_mb} MB.")

    suffix = Path(file.filename or ".jpg").suffix or ".jpg"
    upload_dir = Path("uploads/photos")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    (upload_dir / filename).write_bytes(contents)

    return {"photo_url": f"/static/photos/{filename}"}


@router.get("/{patient_id}", response_model=List[HealthReadingResponse])
async def get_reading_history(
    patient_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    patient = await _get_active_patient_or_404(patient_id, db)
    await _assert_can_access_patient(patient, current_user, db)

    result = await db.execute(
        select(HealthReading)
        .where(HealthReading.patient_id == patient_id)
        .order_by(HealthReading.recorded_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{patient_id}/latest", response_model=LatestVitalsResponse)
async def get_latest_vitals(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    patient = await _get_active_patient_or_404(patient_id, db)
    await _assert_can_access_patient(patient, current_user, db)

    result = await db.execute(
        select(HealthReading)
        .where(HealthReading.patient_id == patient_id)
        .order_by(HealthReading.recorded_at.desc())
        .limit(100)
    )
    readings = result.scalars().all()

    latest: dict = {}
    last_updated: Optional[datetime] = None
    vital_fields = [
        "systolic_bp",
        "diastolic_bp",
        "glucose",
        "weight",
        "temperature",
        "oxygen_saturation",
        "heart_rate",
    ]

    for reading in readings:
        for field in vital_fields:
            if field not in latest and getattr(reading, field) is not None:
                latest[field] = getattr(reading, field)
                if last_updated is None or reading.recorded_at > last_updated:
                    last_updated = reading.recorded_at
        if all(field in latest for field in vital_fields):
            break

    return LatestVitalsResponse(patient_id=patient_id, last_updated=last_updated, **latest)


VITAL_MAP = {
    "systolic_bp": (HealthReading.systolic_bp, "mmHg"),
    "diastolic_bp": (HealthReading.diastolic_bp, "mmHg"),
    "glucose": (HealthReading.glucose, "mg/dL"),
    "weight": (HealthReading.weight, "kg"),
    "temperature": (HealthReading.temperature, "C"),
    "oxygen_saturation": (HealthReading.oxygen_saturation, "%"),
    "heart_rate": (HealthReading.heart_rate, "bpm"),
}


@router.get("/{patient_id}/trend/{vital}", response_model=TrendResponse)
async def get_trend(
    patient_id: uuid.UUID,
    vital: str,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if vital not in VITAL_MAP:
        raise HTTPException(status_code=400, detail=f"Unknown vital '{vital}'. Choose from: {', '.join(VITAL_MAP)}")

    patient = await _get_active_patient_or_404(patient_id, db)
    await _assert_can_access_patient(patient, current_user, db)

    column, unit = VITAL_MAP[vital]
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(HealthReading.recorded_at, column)
        .where(
            HealthReading.patient_id == patient_id,
            column.isnot(None),
            HealthReading.recorded_at >= cutoff,
        )
        .order_by(HealthReading.recorded_at.asc())
    )

    return TrendResponse(
        patient_id=patient_id,
        vital=vital,
        unit=unit,
        data=[TrendPoint(recorded_at=row[0], value=float(row[1])) for row in result.all()],
    )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.caregiver_log import CaregiverLog, LogType
from app.models.health_reading import HealthReading
from app.models.patient import PatientProfile
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.caregiver import VitalsLog, NoteLog

router = APIRouter(prefix="/caregiver", tags=["Caregiver"])

@router.post("/vitals")
async def log_vitals(
    payload: VitalsLog,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    systolic_bp = None
    diastolic_bp = None
    if payload.bp:
        try:
            systolic, diastolic = payload.bp.split("/", maxsplit=1)
            systolic_bp = int(systolic.strip())
            diastolic_bp = int(diastolic.strip())
        except ValueError:
            raise HTTPException(status_code=400, detail="BP must use systolic/diastolic format, e.g. 120/80")

    if any(value is not None for value in (payload.glucose, systolic_bp, diastolic_bp, payload.temperature)):
        reading = HealthReading(
            patient_id=payload.patient_id,
            recorded_by=current_user.id,
            glucose=payload.glucose,
            systolic_bp=systolic_bp,
            diastolic_bp=diastolic_bp,
            temperature=payload.temperature,
            notes=payload.note,
        )
        db.add(reading)
    
    # Log to caregiver_log
    log = CaregiverLog(
        patient_id=payload.patient_id,
        caregiver_id=current_user.id,
        log_type=LogType.VITALS,
        summary=f"Manual vitals: {', '.join(filter(None, [f'BP {payload.bp}', f'Glucose {payload.glucose}', f'Temp {payload.temperature}']))}",
        detail=payload.note
    )
    db.add(log)
    await db.commit()
    return {"ok": True}

@router.post("/notes")
async def add_note(
    payload: NoteLog,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    log = CaregiverLog(
        patient_id=payload.patient_id,
        caregiver_id=current_user.id,
        log_type=LogType.NOTE,
        summary="Caregiver observation",
        detail=payload.note
    )
    db.add(log)
    await db.commit()
    return {"ok": True}

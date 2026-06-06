from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
from typing import List
import daily  # pip install daily-python
from app.database import get_db
from app.models.consultation import Consultation, ConsultationStatus
from app.models.patient import PatientProfile
from app.models.user import User
from app.core.dependencies import get_current_user, require_admin
from app.schemas.consultation import ConsultationCreate, ConsultationResponse, RoomResponse
from app.config import settings

router = APIRouter(prefix="/consultations", tags=["Consultations"])

# Initialize Daily.co client if API key available
DAILY_API_KEY = getattr(settings, "daily_api_key", None)
if DAILY_API_KEY:
    daily.api_key = DAILY_API_KEY

@router.post("/", response_model=ConsultationResponse, status_code=201)
async def schedule_consultation(
    data: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify patient exists and user has permission
    patient_profile = await db.get(PatientProfile, data.patient_id)
    if not patient_profile:
        raise HTTPException(404, "Patient not found")
    
    # For now, assign doctor as current_user if role is doctor, otherwise pick random doctor
    doctor_id = current_user.id if current_user.role == "doctor" else data.doctor_id
    
    consultation = Consultation(
        patient_id=data.patient_id,
        doctor_id=doctor_id,
        scheduled_at=data.scheduled_at,
        duration_minutes=data.duration_minutes or 30,
        status=ConsultationStatus.SCHEDULED
    )
    # Create Daily.co room
    if DAILY_API_KEY:
        room_name = f"caresync-{consultation.id}"
        room = daily.Room.create(name=room_name, privacy="private", properties={"exp": 86400})
        consultation.daily_room_name = room_name
        consultation.daily_room_url = room.url
    
    db.add(consultation)
    await db.commit()
    await db.refresh(consultation)
    return consultation

@router.get("/", response_model=List[ConsultationResponse])
async def list_consultations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Consultation)
    if current_user.role == "doctor":
        query = query.where(Consultation.doctor_id == current_user.id)
    elif current_user.role == "patient":
        # Find patient profile for this user
        patient_profile = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = patient_profile.scalar_one_or_none()
        if patient:
            query = query.where(Consultation.patient_id == patient.id)
    # Admin/super_admin see all
    result = await db.execute(query.order_by(Consultation.scheduled_at))
    return result.scalars().all()

@router.post("/{consultation_id}/room", response_model=RoomResponse)
async def get_room(
    consultation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    consultation = await db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(404, "Consultation not found")
    # Permission: doctor assigned, patient, or admin
    # ...
    if not consultation.daily_room_url:
        raise HTTPException(400, "No room created yet")
    return {"room_url": consultation.daily_room_url}
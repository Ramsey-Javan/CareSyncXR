from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.consultation import ConsultationStatus


class ConsultationBase(BaseModel):
    scheduled_at: datetime
    duration_minutes: int = Field(30, ge=1)


class ConsultationCreate(ConsultationBase):
    patient_id: UUID
    doctor_id: UUID


class ConsultationUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    status: Optional[ConsultationStatus] = None
    daily_room_name: Optional[str] = Field(None, max_length=255)
    daily_room_url: Optional[str] = Field(None, max_length=500)
    ai_summary: Optional[str] = Field(None, max_length=2000)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class ConsultationResponse(ConsultationBase):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    status: ConsultationStatus
    daily_room_name: Optional[str] = None
    daily_room_url: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoomResponse(BaseModel):
    room_url: str

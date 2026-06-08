from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, UUID4

from app.models.consultation import ConsultationStatus


class ConsultationBase(BaseModel):
    scheduled_at: datetime
    duration_minutes: int = Field(30, ge=1)


class ConsultationCreate(ConsultationBase):
    patient_id: UUID4
    doctor_id: UUID4


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
    id: UUID4
    patient_id: UUID4
    doctor_id: UUID4
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

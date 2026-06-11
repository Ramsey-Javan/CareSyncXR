from datetime import datetime
from typing import Optional

from uuid import UUID
from pydantic import BaseModel, Field

from app.models.caregiver_log import LogType


class CaregiverLogBase(BaseModel):
    log_type: LogType
    summary: str = Field(..., max_length=255)
    detail: Optional[str] = None


class CaregiverLogCreate(CaregiverLogBase):
    patient_id: UUID
    caregiver_id: UUID


class CaregiverLogUpdate(BaseModel):
    log_type: Optional[LogType] = None
    summary: Optional[str] = Field(None, max_length=255)
    detail: Optional[str] = None


class CaregiverLogResponse(CaregiverLogBase):
    id: UUID
    patient_id: UUID
    caregiver_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

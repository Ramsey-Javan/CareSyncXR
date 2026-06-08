from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, UUID4

from app.models.caregiver_log import LogType


class CaregiverLogBase(BaseModel):
    log_type: LogType
    summary: str = Field(..., max_length=255)
    detail: Optional[str] = None


class CaregiverLogCreate(CaregiverLogBase):
    patient_id: UUID4
    caregiver_id: UUID4


class CaregiverLogUpdate(BaseModel):
    log_type: Optional[LogType] = None
    summary: Optional[str] = Field(None, max_length=255)
    detail: Optional[str] = None


class CaregiverLogResponse(CaregiverLogBase):
    id: UUID4
    patient_id: UUID4
    caregiver_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

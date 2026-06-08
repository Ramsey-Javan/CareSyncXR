from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, UUID4


class MedicationBase(BaseModel):
    name: str = Field(..., max_length=255)
    dosage: str = Field(..., max_length=100)
    schedule: List[str]
    next_due_at: datetime


class MedicationCreate(MedicationBase):
    patient_id: UUID4
    last_administered_at: Optional[datetime] = None


class MedicationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    dosage: Optional[str] = Field(None, max_length=100)
    schedule: Optional[List[str]] = None
    last_administered_at: Optional[datetime] = None
    next_due_at: Optional[datetime] = None
    missed: Optional[bool] = None
    adherence_percent: Optional[float] = Field(None, ge=0, le=100)


class MedicationResponse(MedicationBase):
    id: UUID4
    patient_id: UUID4
    last_administered_at: Optional[datetime] = None
    missed: bool
    adherence_percent: float
    created_at: datetime

    class Config:
        from_attributes = True

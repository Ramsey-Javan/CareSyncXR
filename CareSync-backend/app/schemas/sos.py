from datetime import datetime
from typing import Any, Dict, Optional

from uuid import UUID
from pydantic import BaseModel, Field

from app.models.sos_event import SOSStatus


class SOSPayload(BaseModel):
    patient_code: str
    patient_id: UUID
    vitals: Dict[str, Any]
    location: Dict[str, Any]


class SOSRoutingResponse(BaseModel):
    hospital_id: str
    hospital_name: str
    distance_km: float
    eta_minutes: int
    status: str
    next_of_kin_notified: bool
    escalation_level: int


class SOSEventBase(BaseModel):
    vitals_snapshot: Dict[str, Any]
    location: Dict[str, Any]


class SOSEventCreate(SOSEventBase):
    patient_id: UUID
    triggered_by: UUID


class SOSEventUpdate(BaseModel):
    status: Optional[SOSStatus] = None
    hospital_id: Optional[str] = Field(None, max_length=100)
    hospital_name: Optional[str] = Field(None, max_length=255)
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None
    notified_caregiver: Optional[bool] = None
    notified_next_of_kin: Optional[bool] = None
    resolved_at: Optional[datetime] = None


class SOSEventResponse(SOSEventBase):
    id: UUID
    patient_id: UUID
    triggered_by: UUID
    status: SOSStatus
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None
    notified_caregiver: bool
    notified_next_of_kin: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

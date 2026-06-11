from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.alert import AlertSeverity


class AlertBase(BaseModel):
    severity: AlertSeverity
    message: str = Field(..., max_length=500)


class AlertCreate(AlertBase):
    patient_id: UUID
    reading_id: Optional[UUID] = None


class AlertUpdate(BaseModel):
    severity: Optional[AlertSeverity] = None
    message: Optional[str] = Field(None, max_length=500)
    acknowledged: Optional[bool] = None
    acknowledged_by: Optional[UUID] = None
    acknowledged_at: Optional[datetime] = None


class AcknowledgeAlert(BaseModel):
    acknowledged: bool = True


class AlertResponse(AlertBase):
    id: UUID
    patient_id: UUID
    reading_id: Optional[UUID] = None
    acknowledged: bool
    acknowledged_by: Optional[UUID] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertStatsResponse(BaseModel):
    total_unacknowledged: int
    critical: int
    warning: int
    info: int
    alerts_last_24h: int

class AcknowledgeRequest(BaseModel):
    note: Optional[str] = Field(None, max_length=200)
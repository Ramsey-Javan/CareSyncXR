from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, UUID4

from app.models.alert import AlertSeverity


class AlertBase(BaseModel):
    severity: AlertSeverity
    message: str = Field(..., max_length=500)


class AlertCreate(AlertBase):
    patient_id: UUID4
    reading_id: Optional[UUID4] = None


class AlertUpdate(BaseModel):
    severity: Optional[AlertSeverity] = None
    message: Optional[str] = Field(None, max_length=500)
    acknowledged: Optional[bool] = None
    acknowledged_by: Optional[UUID4] = None
    acknowledged_at: Optional[datetime] = None


class AcknowledgeAlert(BaseModel):
    acknowledged: bool = True


class AlertResponse(AlertBase):
    id: UUID4
    patient_id: UUID4
    reading_id: Optional[UUID4] = None
    acknowledged: bool
    acknowledged_by: Optional[UUID4] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

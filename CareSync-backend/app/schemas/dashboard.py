from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing import Literal
 
 
class PatientStatusCard(BaseModel):
    patient_id: UUID
    status: Literal["healthy", "needs_attention", "critical"]
    last_reading_at: Optional[datetime] = None
 
    class Config:
        from_attributes = True
 
 
class DashboardStatsResponse(BaseModel):
    total_patients: int
    alerts_today: int
    critical_alerts: int
    consultations_today: int
    patient_status_cards: List[PatientStatusCard]
 
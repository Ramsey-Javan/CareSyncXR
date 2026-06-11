from typing import Optional

from uuid import UUID
from pydantic import BaseModel


class VitalsLog(BaseModel):
    patient_id: UUID
    bp: Optional[str] = None
    glucose: Optional[float] = None
    temperature: Optional[float] = None
    note: Optional[str] = None


class NoteLog(BaseModel):
    patient_id: UUID
    note: str

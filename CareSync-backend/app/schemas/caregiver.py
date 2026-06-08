from typing import Optional

from pydantic import BaseModel, UUID4


class VitalsLog(BaseModel):
    patient_id: UUID4
    bp: Optional[str] = None
    glucose: Optional[float] = None
    temperature: Optional[float] = None
    note: Optional[str] = None


class NoteLog(BaseModel):
    patient_id: UUID4
    note: str

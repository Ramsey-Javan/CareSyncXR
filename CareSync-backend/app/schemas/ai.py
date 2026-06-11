from typing import List
from uuid import UUID
from pydantic import BaseModel, Field


class AIAnalyzePayload(BaseModel):
    patient_id: UUID = Field(..., alias="patientId")
    vitals_history: List[dict] = Field(..., alias="vitalsHistory")

    class Config:
        allow_population_by_field_name = True


class AIInsightResponse(BaseModel):
    id: str
    patient_id: UUID = Field(..., alias="patientId")
    patient_name: str = Field(..., alias="patientName")
    summary: str
    risk_level: str = Field(..., alias="riskLevel")
    flags: List[str]
    generated_at: str = Field(..., alias="generatedAt")

    class Config:
        allow_population_by_field_name = True

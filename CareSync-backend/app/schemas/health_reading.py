from datetime import datetime
from typing import Optional

from pydantic import BaseModel, UUID4, field_validator, model_validator


BP_SYSTOLIC_RANGE = (60, 250)
BP_DIASTOLIC_RANGE = (40, 150)
GLUCOSE_RANGE = (20, 600)
WEIGHT_RANGE = (1, 500)
TEMP_RANGE = (30, 45)
O2_RANGE = (50, 100)
HR_RANGE = (20, 300)


class HealthReadingCreate(BaseModel):
    patient_id: UUID4

    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    glucose: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    heart_rate: Optional[int] = None

    symptoms: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    recorded_at: Optional[datetime] = None

    @model_validator(mode="after")
    def at_least_one_vital(self) -> "HealthReadingCreate":
        values = [
            self.systolic_bp,
            self.diastolic_bp,
            self.glucose,
            self.weight,
            self.temperature,
            self.oxygen_saturation,
            self.heart_rate,
            self.symptoms,
        ]
        if all(value is None for value in values):
            raise ValueError("At least one vital or symptom must be provided")
        return self

    @field_validator("systolic_bp")
    @classmethod
    def validate_systolic(cls, value):
        if value is not None and not BP_SYSTOLIC_RANGE[0] <= value <= BP_SYSTOLIC_RANGE[1]:
            raise ValueError(f"Systolic BP must be {BP_SYSTOLIC_RANGE[0]}-{BP_SYSTOLIC_RANGE[1]} mmHg")
        return value

    @field_validator("diastolic_bp")
    @classmethod
    def validate_diastolic(cls, value):
        if value is not None and not BP_DIASTOLIC_RANGE[0] <= value <= BP_DIASTOLIC_RANGE[1]:
            raise ValueError(f"Diastolic BP must be {BP_DIASTOLIC_RANGE[0]}-{BP_DIASTOLIC_RANGE[1]} mmHg")
        return value

    @field_validator("glucose")
    @classmethod
    def validate_glucose(cls, value):
        if value is not None and not GLUCOSE_RANGE[0] <= value <= GLUCOSE_RANGE[1]:
            raise ValueError(f"Glucose must be {GLUCOSE_RANGE[0]}-{GLUCOSE_RANGE[1]} mg/dL")
        return value

    @field_validator("weight")
    @classmethod
    def validate_weight(cls, value):
        if value is not None and not WEIGHT_RANGE[0] <= value <= WEIGHT_RANGE[1]:
            raise ValueError(f"Weight must be {WEIGHT_RANGE[0]}-{WEIGHT_RANGE[1]} kg")
        return value

    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, value):
        if value is not None and not TEMP_RANGE[0] <= value <= TEMP_RANGE[1]:
            raise ValueError(f"Temperature must be {TEMP_RANGE[0]}-{TEMP_RANGE[1]} C")
        return value

    @field_validator("oxygen_saturation")
    @classmethod
    def validate_o2(cls, value):
        if value is not None and not O2_RANGE[0] <= value <= O2_RANGE[1]:
            raise ValueError(f"O2 saturation must be {O2_RANGE[0]}-{O2_RANGE[1]}%")
        return value

    @field_validator("heart_rate")
    @classmethod
    def validate_heart_rate(cls, value):
        if value is not None and not HR_RANGE[0] <= value <= HR_RANGE[1]:
            raise ValueError(f"Heart rate must be {HR_RANGE[0]}-{HR_RANGE[1]} bpm")
        return value


class HealthReadingUpdate(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    glucose: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    heart_rate: Optional[int] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    recorded_at: Optional[datetime] = None


class HealthReadingResponse(BaseModel):
    id: UUID4
    patient_id: UUID4
    recorded_by: UUID4
    recorded_at: datetime

    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    glucose: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    heart_rate: Optional[int] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True


class LatestVitalsResponse(BaseModel):
    patient_id: UUID4
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    glucose: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    heart_rate: Optional[int] = None
    last_updated: Optional[datetime] = None


class TrendPoint(BaseModel):
    recorded_at: datetime
    value: float


class TrendResponse(BaseModel):
    patient_id: UUID4
    vital: str
    unit: str
    data: list[TrendPoint]

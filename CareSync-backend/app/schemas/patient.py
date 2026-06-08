from pydantic import BaseModel, Field, UUID4, field_validator
from datetime import date
from typing import Optional, List
from uuid import UUID

class PatientProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    blood_type: Optional[str] = Field(None, pattern="^(A|B|AB|O)[+-]$")
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientProfileCreate(PatientProfileBase):
    user_id: UUID4  # Must reference an existing user with role='patient'

class PatientProfileUpdate(PatientProfileBase):
    is_active: Optional[bool] = None

class PatientProfileResponse(PatientProfileBase):
    id: UUID4
    user_id: UUID4
    is_active: bool

    class Config:
        from_attributes = True

class PatientWithUserResponse(PatientProfileResponse):
    user_email: str
    user_full_name: str
    doctors: List[UUID4]  # list of doctor user IDs
    caregivers: List[UUID4]  # list of caregiver user IDs

class PatientListParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=500)
    search: Optional[str] = None  # search by patient name or email
    doctor_id: Optional[UUID4] = None
    caregiver_id: Optional[UUID4] = None
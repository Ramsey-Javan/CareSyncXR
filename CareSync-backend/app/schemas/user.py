from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from typing import Optional
from datetime import datetime

VALID_ROLES = {"super_admin", "admin", "doctor", "caregiver", "patient"}

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # super_admin, admin, doctor, caregiver, patient
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    agency_id: Optional[UUID] = None  # Required if role != super_admin

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Role must be a string")
        normalized = v.lower().strip()
        if normalized not in VALID_ROLES:
            raise ValueError(
                f"Invalid role: '{v}'. Must be one of: {', '.join(sorted(VALID_ROLES))}"
            )
        return normalized

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, v):
        if v is None:
            return v
        if not isinstance(v, str):
            raise ValueError("Role must be a string")
        normalized = v.lower().strip()
        if normalized not in VALID_ROLES:
            raise ValueError(
                f"Invalid role: '{v}'. Must be one of: {', '.join(sorted(VALID_ROLES))}"
            )
        return normalized

class UserResponse(UserBase):
    id: UUID
    agency_id: Optional[UUID]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
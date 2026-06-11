from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class HospitalBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    is_active: bool = True


class HospitalCreate(HospitalBase):
    agency_id: Optional[UUID] = None


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None


class HospitalResponse(HospitalBase):
    id: UUID
    agency_id: Optional[UUID] = None

    class Config:
        from_attributes = True

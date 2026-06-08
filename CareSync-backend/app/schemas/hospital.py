from typing import Optional
from pydantic import BaseModel, UUID4


class HospitalBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    is_active: bool = True


class HospitalCreate(HospitalBase):
    agency_id: Optional[UUID4] = None


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None


class HospitalResponse(HospitalBase):
    id: UUID4
    agency_id: Optional[UUID4] = None

    class Config:
        from_attributes = True

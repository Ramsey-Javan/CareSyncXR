from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.agency import Agency
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse
from app.core.dependencies import require_admin, require_super_admin, get_current_user
from app.models.user import User

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("/", response_model=List[HospitalResponse])
async def list_hospitals(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    super_admin sees every hospital.
    admin sees hospitals in their agency.
    doctors, caregivers, and patients see their assigned hospital.
    """
    query = select(Hospital)
    if not include_inactive:
        query = query.where(Hospital.is_active == True)
    if current_user.role == "super_admin":
        pass
    elif current_user.role == "admin":
        query = query.where(Hospital.agency_id == current_user.agency_id)
    else:
        if current_user.hospital_id is None:
            return []
        query = query.where(Hospital.id == current_user.hospital_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital(
    payload: HospitalCreate,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if admin_user.role == "super_admin":
        if not payload.agency_id:
            raise HTTPException(status_code=400, detail="agency_id is required when super admin creates a hospital")
        agency = await db.get(Agency, payload.agency_id)
        if not agency:
            raise HTTPException(status_code=404, detail=f"Agency {payload.agency_id} not found")
        agency_id = payload.agency_id
    else:
        if not admin_user.agency_id:
            raise HTTPException(status_code=400, detail="Admin is not associated with any agency")
        agency_id = admin_user.agency_id

    hospital = Hospital(**payload.model_dump(exclude={"agency_id"}), agency_id=agency_id)
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return hospital


@router.get("/{hospital_id}", response_model=HospitalResponse)
async def get_hospital(
    hospital_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if current_user.role == "admin" and hospital.agency_id != current_user.agency_id:
        raise HTTPException(status_code=403, detail="Hospital belongs to a different agency")
    if current_user.role not in ("super_admin", "admin") and current_user.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this hospital")

    return hospital


@router.put("/{hospital_id}", response_model=HospitalResponse)
async def update_hospital(
    hospital_id: UUID,
    payload: HospitalUpdate,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if admin_user.role != "super_admin" and hospital.agency_id != admin_user.agency_id:
        raise HTTPException(status_code=403, detail="Cannot update a hospital from a different agency")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(hospital, field, value)

    await db.commit()
    await db.refresh(hospital)
    return hospital


@router.delete("/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hospital(
    hospital_id: UUID,
    admin_user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    await db.delete(hospital)
    await db.commit()

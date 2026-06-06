from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile, patient_doctor, patient_caregiver
from app.schemas.patient import (
    PatientProfileCreate, PatientProfileUpdate,
    PatientProfileResponse, PatientWithUserResponse, PatientListParams
)
from app.core.dependencies import get_current_user, require_admin, get_agency_id_from_user

router = APIRouter(prefix="/patients", tags=["Patients"])

async def get_patient_with_relationships(db: AsyncSession, patient_id: UUID):
    stmt = select(PatientProfile).where(
        PatientProfile.id == patient_id,
        PatientProfile.is_active == True
    ).options(
        selectinload(PatientProfile.user),
        selectinload(PatientProfile.doctors),
        selectinload(PatientProfile.caregivers)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

@router.post("/", response_model=PatientProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientProfileCreate,
    current_user: User = Depends(require_admin),  # Only admins can create patient profiles
    db: AsyncSession = Depends(get_db)
):
    # Verify that the user exists and has role 'patient'
    user_stmt = select(User).where(User.id == data.user_id, User.role == "patient")
    user_result = await db.execute(user_stmt)
    patient_user = user_result.scalar_one_or_none()
    if not patient_user:
        raise HTTPException(status_code=404, detail="User with role 'patient' not found")

    # Check if patient profile already exists for this user
    existing = await db.execute(select(PatientProfile).where(PatientProfile.user_id == data.user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Patient profile already exists for this user")

    # Admins can only create patients within their agency (or super admin can do cross-agency)
    if current_user.role != "super_admin":
        if patient_user.agency_id != current_user.agency_id:
            raise HTTPException(status_code=403, detail="Cannot create patient profile for user from another agency")

    new_profile = PatientProfile(**data.model_dump())
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    return new_profile

@router.get("/", response_model=List[PatientWithUserResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    doctor_id: Optional[UUID] = None,
    caregiver_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    agency_id: Optional[UUID] = Depends(get_agency_id_from_user)
):
    # Build base query with joins
    stmt = select(PatientProfile).where(PatientProfile.is_active == True)

    # Agency isolation: if not super_admin, filter by agency_id (via user.agency_id)
    if current_user.role != "super_admin":
        stmt = stmt.join(User, PatientProfile.user_id == User.id).where(User.agency_id == current_user.agency_id)
    elif agency_id:
        stmt = stmt.join(User, PatientProfile.user_id == User.id).where(User.agency_id == agency_id)

    # Filtering by doctor or caregiver
    if doctor_id:
        stmt = stmt.join(patient_doctor, patient_doctor.c.patient_id == PatientProfile.id).where(patient_doctor.c.doctor_id == doctor_id)
    if caregiver_id:
        stmt = stmt.join(patient_caregiver, patient_caregiver.c.patient_id == PatientProfile.id).where(patient_caregiver.c.caregiver_id == caregiver_id)

    # Search by patient name or email
    if search:
        stmt = stmt.join(User, PatientProfile.user_id == User.id).where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    # Apply pagination
    stmt = stmt.offset(skip).limit(limit).options(
        selectinload(PatientProfile.user),
        selectinload(PatientProfile.doctors),
        selectinload(PatientProfile.caregivers)
    )
    result = await db.execute(stmt)
    patients = result.scalars().all()

    # Build response including user details and doctor/caregiver IDs
    response = []
    for p in patients:
        response.append(PatientWithUserResponse(
            id=p.id,
            user_id=p.user_id,
            is_active=p.is_active,
            date_of_birth=p.date_of_birth,
            gender=p.gender,
            blood_type=p.blood_type,
            allergies=p.allergies,
            chronic_conditions=p.chronic_conditions,
            emergency_contact_name=p.emergency_contact_name,
            emergency_contact_phone=p.emergency_contact_phone,
            user_email=p.user.email,
            user_full_name=p.user.full_name,
            doctors=[d.id for d in p.doctors],
            caregivers=[c.id for c in p.caregivers]
        ))
    return response

@router.get("/{patient_id}", response_model=PatientWithUserResponse)
async def get_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    patient = await get_patient_with_relationships(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Permission check
    if current_user.role not in ["super_admin", "admin"]:
        # Doctor can see if assigned, caregiver can see if assigned
        if current_user.role == "doctor":
            if current_user not in patient.doctors:
                raise HTTPException(status_code=403, detail="Not authorized to view this patient")
        elif current_user.role == "caregiver":
            if current_user not in patient.caregivers:
                raise HTTPException(status_code=403, detail="Not authorized to view this patient")
        elif current_user.id != patient.user_id:  # patient themselves
            raise HTTPException(status_code=403, detail="Not authorized")

    return PatientWithUserResponse(
        id=patient.id,
        user_id=patient.user_id,
        is_active=patient.is_active,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_type=patient.blood_type,
        allergies=patient.allergies,
        chronic_conditions=patient.chronic_conditions,
        emergency_contact_name=patient.emergency_contact_name,
        emergency_contact_phone=patient.emergency_contact_phone,
        user_email=patient.user.email,
        user_full_name=patient.user.full_name,
        doctors=[d.id for d in patient.doctors],
        caregivers=[c.id for c in patient.caregivers]
    )

@router.put("/{patient_id}", response_model=PatientProfileResponse)
async def update_patient(
    patient_id: UUID,
    data: PatientProfileUpdate,
    current_user: User = Depends(require_admin),  # Only admins can update profile details
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient or not patient.is_active:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check agency permission (admin within same agency or super admin)
    if current_user.role != "super_admin":
        user_stmt = select(User).where(User.id == patient.user_id)
        user_res = await db.execute(user_stmt)
        patient_user = user_res.scalar_one()
        if patient_user.agency_id != current_user.agency_id:
            raise HTTPException(status_code=403, detail="Cannot update patient from another agency")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)

    await db.commit()
    await db.refresh(patient)
    return patient

@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role != "super_admin":
        user_stmt = select(User).where(User.id == patient.user_id)
        user_res = await db.execute(user_stmt)
        patient_user = user_res.scalar_one()
        if patient_user.agency_id != current_user.agency_id:
            raise HTTPException(status_code=403, detail="Cannot delete patient from another agency")
    await db.delete(patient)
    await db.commit()
    return None

# Additional endpoints to assign doctors/caregivers
@router.post("/{patient_id}/doctors/{doctor_id}", status_code=204)
async def assign_doctor(
    patient_id: UUID,
    doctor_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = await db.get(User, doctor_id)
    if not doctor or doctor.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found")
    # Check agency
    if current_user.role != "super_admin":
        if doctor.agency_id != current_user.agency_id or patient.user.agency_id != current_user.agency_id:
            raise HTTPException(status_code=403, detail="Agency mismatch")
    if doctor not in patient.doctors:
        patient.doctors.append(doctor)
        await db.commit()
    return None

@router.delete("/{patient_id}/doctors/{doctor_id}", status_code=204)
async def remove_doctor(
    patient_id: UUID,
    doctor_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = await db.get(User, doctor_id)
    if doctor in patient.doctors:
        patient.doctors.remove(doctor)
        await db.commit()
    return None

# Similar for caregivers
@router.post("/{patient_id}/caregivers/{caregiver_id}", status_code=204)
async def assign_caregiver(
    patient_id: UUID,
    caregiver_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    caregiver = await db.get(User, caregiver_id)
    if not caregiver or caregiver.role != "caregiver":
        raise HTTPException(status_code=404, detail="Caregiver not found")
    if current_user.role != "super_admin":
        if caregiver.agency_id != current_user.agency_id or patient.user.agency_id != current_user.agency_id:
            raise HTTPException(status_code=403, detail="Agency mismatch")
    if caregiver not in patient.caregivers:
        patient.caregivers.append(caregiver)
        await db.commit()
    return None

@router.delete("/{patient_id}/caregivers/{caregiver_id}", status_code=204)
async def remove_caregiver(
    patient_id: UUID,
    caregiver_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    caregiver = await db.get(User, caregiver_id)
    if caregiver in patient.caregivers:
        patient.caregivers.remove(caregiver)
        await db.commit()
    return None
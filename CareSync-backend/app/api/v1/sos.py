from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime
import math
from app.database import get_db
from app.models.sos_event import SOSEvent, SOSStatus
from app.models.patient import PatientProfile
from app.models.user import User
from app.models.hospital import Hospital
from app.core.dependencies import get_current_user
from app.schemas.sos import SOSPayload, SOSRoutingResponse, SOSEventResponse
from app.core.notifications import notify_caregiver, notify_next_of_kin  # we'll create this

router = APIRouter(prefix="/sos", tags=["SOS"])

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Great-circle distance in km
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _estimate_eta_minutes(distance_km: float) -> int:
    # Assume 40 km/h average speed
    if distance_km <= 0:
        return 1
    return max(1, math.ceil((distance_km / 40.0) * 60.0))

@router.post("/", response_model=dict)
async def trigger_sos(
    payload: SOSPayload,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find patient profile
    patient_profile = await db.get(PatientProfile, payload.patient_id)
    if not patient_profile:
        raise HTTPException(404, "Patient profile not found")
    
    # Read lat/lng from payload
    if "lat" not in payload.location or "lng" not in payload.location:
        raise HTTPException(status_code=400, detail="Location must include lat and lng")

    lat = float(payload.location["lat"])
    lng = float(payload.location["lng"])

    result = await db.execute(select(Hospital).where(Hospital.is_active == True))
    hospitals = result.scalars().all()
    if not hospitals:
        raise HTTPException(status_code=503, detail="No hospitals available for routing")

    # Select nearest hospital by distance
    nearest = min(
        hospitals,
        key=lambda h: _haversine_km(lat, lng, h.latitude, h.longitude),
    )
    distance_km = _haversine_km(lat, lng, nearest.latitude, nearest.longitude)
    eta_minutes = _estimate_eta_minutes(distance_km)
    
    sos = SOSEvent(
        patient_id=payload.patient_id,
        triggered_by=current_user.id,
        vitals_snapshot=payload.vitals,
        location=payload.location,
        status=SOSStatus.ROUTING,
        hospital_id=str(nearest.id),
        hospital_name=nearest.name,
        distance_km=distance_km,
        eta_minutes=eta_minutes
    )
    db.add(sos)
    await db.commit()
    await db.refresh(sos)
    
    # Send notifications in background
    background_tasks.add_task(notify_caregiver, patient_profile, sos)
    background_tasks.add_task(notify_next_of_kin, patient_profile, sos)
    
    return {
        "id": str(sos.id),
        "routing": {
            "hospitalId": sos.hospital_id,
            "hospitalName": sos.hospital_name,
            "distanceKm": sos.distance_km,
            "etaMinutes": sos.eta_minutes,
            "status": sos.status.value,
            "nextOfKinNotified": True,
            "escalationLevel": 2
        }
    }

@router.get("/{sos_id}/routing", response_model=SOSRoutingResponse)
async def get_routing(
    sos_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sos = await db.get(SOSEvent, sos_id)
    if not sos:
        raise HTTPException(404, "SOS event not found")
    return SOSRoutingResponse(
        hospital_id=sos.hospital_id,
        hospital_name=sos.hospital_name,
        distance_km=sos.distance_km,
        eta_minutes=sos.eta_minutes,
        status=sos.status.value,
        next_of_kin_notified=sos.notified_next_of_kin,
        escalation_level=2
    )
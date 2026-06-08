from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.alert import Alert
from app.models.patient import PatientProfile
from app.models.user import User
from app.core.dependencies import get_current_user, get_agency_id_from_user
from app.schemas.alert import AlertResponse, AcknowledgeAlert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    agency_id: Optional[UUID] = Depends(get_agency_id_from_user)
):
    # Build query with agency isolation
    query = select(Alert).join(PatientProfile, Alert.patient_id == PatientProfile.id)
    if current_user.role != "super_admin" and agency_id:
        query = query.join(User, PatientProfile.user_id == User.id).where(User.agency_id == agency_id)
    query = query.order_by(Alert.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.acknowledged = True
    alert.acknowledged_by = current_user.id
    alert.acknowledged_at = datetime.utcnow()
    await db.commit()
    return {"ok": True}
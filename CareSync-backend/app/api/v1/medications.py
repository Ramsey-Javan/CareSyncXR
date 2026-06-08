from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models.medication import Medication
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/medications", tags=["Medications"])

@router.post("/{medication_id}/administer")
async def administer_medication(
    medication_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    med = await db.get(Medication, medication_id)
    if not med:
        raise HTTPException(404, "Medication not found")
    med.last_administered_at = datetime.utcnow()
    # Recalculate next due date based on schedule
    # ...
    med.missed = False
    med.adherence_percent = min(100, med.adherence_percent + 2)
    await db.commit()
    return {"ok": True}
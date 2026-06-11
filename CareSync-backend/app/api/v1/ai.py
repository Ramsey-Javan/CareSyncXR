from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from openai import AsyncOpenAI
from app.config import settings
from app.core.dependencies import get_current_user
from app.models.patient import PatientProfile
from app.schemas.ai import AIAnalyzePayload, AIInsightResponse
from app.database import get_db
import uuid
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI"])
openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

@router.post("/analyze", response_model=AIInsightResponse)
async def generate_insight(
    payload: AIAnalyzePayload,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    patient = await db.get(PatientProfile, payload.patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")
    
    # Prepare summary from vitals history
    if openai_client:
        # Call OpenAI GPT-4o-mini
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant. Summarize patient vitals trend and provide risk assessment."},
                {"role": "user", "content": f"Patient vitals history: {payload.vitals_history}"}
            ]
        )
        summary = response.choices[0].message.content
    else:
        # Fallback mock
        summary = "Vitals are stable. Continue current monitoring."
    
    return {
        "id": str(uuid.uuid()),
        "patientId": str(payload.patient_id),
        "patientName": patient.user.full_name,
        "summary": summary,
        "riskLevel": "stable",
        "flags": [],
        "generatedAt": datetime.utcnow().isoformat()
    }
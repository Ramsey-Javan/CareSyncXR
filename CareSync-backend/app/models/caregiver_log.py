from sqlalchemy import String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from uuid import uuid4, UUID
from datetime import datetime
import enum

class LogType(str, enum.Enum):
    VITALS = "vitals"
    SYMPTOM = "symptom"
    NOTE = "note"
    MEDICATION = "medication"
    OBSERVATION = "observation"

class CaregiverLog(Base):
    __tablename__ = "caregiver_logs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    caregiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    log_type: Mapped[LogType] = mapped_column(Enum(LogType), nullable=False)
    summary: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
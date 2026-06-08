from sqlalchemy import String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from uuid import uuid4, UUID
from datetime import datetime
import enum

class ConsultationStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(default=30)
    status: Mapped[ConsultationStatus] = mapped_column(Enum(ConsultationStatus), default=ConsultationStatus.SCHEDULED)
    daily_room_name: Mapped[str] = mapped_column(String(255), nullable=True)
    daily_room_url: Mapped[str] = mapped_column(String(500), nullable=True)
    ai_summary: Mapped[str] = mapped_column(String(2000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
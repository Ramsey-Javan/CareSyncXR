from sqlalchemy import String, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from uuid import uuid4, UUID
from datetime import datetime

class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    schedule: Mapped[list] = mapped_column(JSON, nullable=False)  # e.g. ["08:00", "20:00"]
    last_administered_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    next_due_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    missed: Mapped[bool] = mapped_column(default=False)
    adherence_percent: Mapped[float] = mapped_column(default=100.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
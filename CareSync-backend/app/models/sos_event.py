from sqlalchemy import String, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from uuid import uuid4, UUID
from datetime import datetime
import enum

class SOSStatus(str, enum.Enum):
    PENDING = "pending"
    ROUTING = "routing"
    DISPATCHED = "dispatched"
    ARRIVED = "arrived"
    RESOLVED = "resolved"

class SOSEvent(Base):
    __tablename__ = "sos_events"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    triggered_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    vitals_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    location: Mapped[dict] = mapped_column(JSON, nullable=False)  # {lat, lng, label}
    status: Mapped[SOSStatus] = mapped_column(Enum(SOSStatus), default=SOSStatus.PENDING)
    hospital_id: Mapped[str] = mapped_column(String(100), nullable=True)
    hospital_name: Mapped[str] = mapped_column(String(255), nullable=True)
    distance_km: Mapped[float] = mapped_column(nullable=True)
    eta_minutes: Mapped[int] = mapped_column(nullable=True)
    notified_caregiver: Mapped[bool] = mapped_column(default=False)
    notified_next_of_kin: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
from sqlalchemy import String, ForeignKey, Date, Text, Boolean, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from uuid import uuid4
from datetime import date
from typing import Optional

# Junction tables for many-to-many relationships
patient_doctor = Table(
    "patient_doctor",
    Base.metadata,
    Column("patient_id", UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("doctor_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

patient_caregiver = Table(
    "patient_caregiver",
    Base.metadata,
    Column("patient_id", UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("caregiver_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_type: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    allergies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    chronic_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user = relationship("User", backref="patient_profile")
    doctors = relationship("User", secondary=patient_doctor, backref="assigned_patients")
    caregivers = relationship("User", secondary=patient_caregiver, backref="assigned_patients_caregiver")
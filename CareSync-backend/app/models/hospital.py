from sqlalchemy import String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from uuid import uuid4, UUID


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    agency_id: Mapped[UUID] = mapped_column(ForeignKey("agencies.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    agency = relationship("Agency", back_populates="hospitals")
    users = relationship("User", back_populates="hospital")

import logging
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Agency, User
from app.core.auth import get_password_hash
from uuid import UUID

logger = logging.getLogger(__name__)

# Fixed UUIDs for predictable seeding
FIXED_AGENCY_ID = UUID("11111111-1111-1111-1111-111111111111")
SUPER_ADMIN_ID = UUID("22222222-2222-2222-2222-222222222222")
AGENCY_ADMIN_ID = UUID("33333333-3333-3333-3333-333333333333")
DOCTOR_ID = UUID("44444444-4444-4444-4444-444444444444")
CAREGIVER_ID = UUID("55555555-5555-5555-5555-555555555555")
PATIENT_ID = UUID("66666666-6666-6666-6666-666666666666")

async def seed_database():
    async with AsyncSessionLocal() as db:
        # Check if agency already exists by fixed ID
        result = await db.execute(select(Agency).where(Agency.id == FIXED_AGENCY_ID))
        agency = result.scalar_one_or_none()
        if agency:
            logger.info("Database already seeded (agency exists). Skipping.")
            return

        logger.info("Seeding database with fixed IDs...")

        # 1. Create agency with fixed ID
        agency = Agency(
            id=FIXED_AGENCY_ID,
            name="Demo Health System"
        )
        db.add(agency)
        await db.flush()

        # 2. Super Admin (no agency)
        super_admin = User(
            id=SUPER_ADMIN_ID,
            email="super@caresync.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Super Admin",
            role="super_admin",
            is_active=True
        )
        db.add(super_admin)

        # 3. Agency Admin
        agency_admin = User(
            id=AGENCY_ADMIN_ID,
            agency_id=FIXED_AGENCY_ID,
            email="admin@demo.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Agency Admin",
            role="admin",
            is_active=True
        )
        db.add(agency_admin)

        # 4. Doctor
        doctor = User(
            id=DOCTOR_ID,
            agency_id=FIXED_AGENCY_ID,
            email="doctor@demo.com",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Smith",
            role="doctor",
            is_active=True
        )
        db.add(doctor)

        # 5. Caregiver
        caregiver = User(
            id=CAREGIVER_ID,
            agency_id=FIXED_AGENCY_ID,
            email="caregiver@demo.com",
            hashed_password=get_password_hash("caregiver123"),
            full_name="Jane Caregiver",
            role="caregiver",
            is_active=True
        )
        db.add(caregiver)

        # 6. Patient
        patient = User(
            id=PATIENT_ID,
            agency_id=FIXED_AGENCY_ID,
            email="patient@demo.com",
            hashed_password=get_password_hash("patient123"),
            full_name="John Patient",
            role="patient",
            is_active=True
        )
        db.add(patient)

        await db.commit()

        print("\n" + "="*50)
        print("SEEDED USER CREDENTIALS")
        print("="*50)
        print(f"Super Admin: super@caresync.com / admin123")
        print(f"Agency Admin: admin@demo.com / admin123")
        print(f"Doctor: doctor@demo.com / doctor123")
        print(f"Caregiver: caregiver@demo.com / caregiver123")
        print(f"Patient: patient@demo.com / patient123")
        print(f"Demo Agency ID: {FIXED_AGENCY_ID}")
        print("="*50 + "\n")
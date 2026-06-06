import logging
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Agency, User, Hospital
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
HOSPITAL_1_ID = UUID("77777777-7777-7777-7777-777777777777")
HOSPITAL_2_ID = UUID("88888888-8888-8888-8888-888888888888")
HOSPITAL_3_ID = UUID("99999999-9999-9999-9999-999999999999")

async def seed_database():
    async with AsyncSessionLocal() as db:
        # Check if agency and hospitals already exist
        agency_result = await db.execute(select(Agency).where(Agency.id == FIXED_AGENCY_ID))
        agency = agency_result.scalar_one_or_none()
        hospital_result = await db.execute(select(Hospital).limit(1))
        hospital = hospital_result.scalar_one_or_none()
        super_admin_result = await db.execute(
            select(User).where(User.email == "super@caresync.com")
        )
        super_admin = super_admin_result.scalar_one_or_none()

        logger.info("Seeding database with fixed IDs (if missing)...")

        if not agency:
            # 1. Create agency with fixed ID
            agency = Agency(
                id=FIXED_AGENCY_ID,
                name="Demo Health System"
            )
            db.add(agency)
            await db.flush()

        # 2. Super Admin (no agency)
        if not super_admin:
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
                hospital_id=HOSPITAL_1_ID,
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
                hospital_id=HOSPITAL_1_ID,
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
                hospital_id=HOSPITAL_1_ID,
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
                hospital_id=HOSPITAL_1_ID,
                email="patient@demo.com",
                hashed_password=get_password_hash("patient123"),
                full_name="John Patient",
                role="patient",
                is_active=True
            )
            db.add(patient)

        if not hospital:
            # 7. Hospitals
            hospitals = [
                Hospital(
                    id=HOSPITAL_1_ID,
                    agency_id=FIXED_AGENCY_ID,
                    name="Nairobi Central Trauma",
                    address="Kenyatta Ave",
                    city="Nairobi",
                    country="Kenya",
                    latitude=-1.2921,
                    longitude=36.8219,
                    is_active=True,
                ),
                Hospital(
                    id=HOSPITAL_2_ID,
                    agency_id=FIXED_AGENCY_ID,
                    name="Aga Khan Emergency",
                    address="3rd Parklands Ave",
                    city="Nairobi",
                    country="Kenya",
                    latitude=-1.2610,
                    longitude=36.8032,
                    is_active=True,
                ),
                Hospital(
                    id=HOSPITAL_3_ID,
                    agency_id=FIXED_AGENCY_ID,
                    name="Mombasa Coast Medical",
                    address="Mama Ngina Dr",
                    city="Mombasa",
                    country="Kenya",
                    latitude=-4.0435,
                    longitude=39.6682,
                    is_active=True,
                ),
            ]
            db.add_all(hospitals)
        else:
            existing_hospitals = await db.execute(select(Hospital).where(Hospital.agency_id.is_(None)))
            for existing_hospital in existing_hospitals.scalars():
                existing_hospital.agency_id = FIXED_AGENCY_ID

        existing_users = await db.execute(
            select(User).where(
                User.agency_id == FIXED_AGENCY_ID,
                User.hospital_id.is_(None),
                User.role.in_(["admin", "doctor", "caregiver", "patient"]),
            )
        )
        for existing_user in existing_users.scalars():
            existing_user.hospital_id = HOSPITAL_1_ID

        await db.commit()

        print("\n" + "="*50)
        print("DEMO CREDENTIALS (PRINTED EACH START)")
        print("="*50)
        print("Super Admin: super@caresync.com / admin123")
        print("Agency Admin: admin@demo.com / admin123")
        print("Doctor: doctor@demo.com / doctor123")
        print("Caregiver: caregiver@demo.com / caregiver123")
        print("Patient: patient@demo.com / patient123")
        print(f"Demo Agency ID: {FIXED_AGENCY_ID}")
        print("Hospitals: Nairobi Central Trauma, Aga Khan Emergency, Mombasa Coast Medical")
        print("="*50 + "\n")

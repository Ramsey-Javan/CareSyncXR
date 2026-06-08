from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base
from app.api.v1 import (
    ai,
    alerts,
    auth,
    caregiver,
    consultations,
    health_readings,
    hospitals,
    medications,
    patients,
    sos,
    users,
)
from app.seed import seed_database
import sys

app = FastAPI(title="CareSync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def ensure_week3_schema(conn):
    statements = [
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS agency_id UUID",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_id UUID",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS systolic_bp INTEGER",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS diastolic_bp INTEGER",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS glucose DOUBLE PRECISION",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS temperature DOUBLE PRECISION",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS oxygen_saturation INTEGER",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS heart_rate INTEGER",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS symptoms TEXT",
        "ALTER TABLE health_readings ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)",
        "CREATE INDEX IF NOT EXISTS ix_health_readings_recorded_at ON health_readings (recorded_at)",
        "CREATE INDEX IF NOT EXISTS ix_health_readings_patient_id ON health_readings (patient_id)",
    ]
    for statement in statements:
        await conn.execute(text(statement))

    await conn.execute(
        text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'fk_hospitals_agency_id'
                ) THEN
                    ALTER TABLE hospitals
                    ADD CONSTRAINT fk_hospitals_agency_id
                    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_hospital_id'
                ) THEN
                    ALTER TABLE users
                    ADD CONSTRAINT fk_users_hospital_id
                    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'health_readings' AND column_name = 'reading_type'
                ) THEN
                    ALTER TABLE health_readings ALTER COLUMN reading_type DROP NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'health_readings' AND column_name = 'value'
                ) THEN
                    ALTER TABLE health_readings ALTER COLUMN value DROP NOT NULL;
                END IF;
            END $$;
            """
        )
    )


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_week3_schema(conn)
    await seed_database()

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(health_readings.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(sos.router, prefix="/api/v1")
app.include_router(consultations.router, prefix="/api/v1")
app.include_router(caregiver.router, prefix="/api/v1")
app.include_router(medications.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(hospitals.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}

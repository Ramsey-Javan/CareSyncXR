import pytest
from httpx import AsyncClient
from app.main import app
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.agency import Agency
from app.core.auth import get_password_hash

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

async def test_create_user_as_admin(client):
    # Create agency
    async with AsyncSessionLocal() as db:
        agency = Agency(name="Test Agency")
        db.add(agency)
        await db.commit()
        await db.refresh(agency)

        # Create admin user
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin",
            role="admin",
            agency_id=agency.id
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)

    # Login as admin
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    token = login_resp.json()["access_token"]

    # Create a new user
    resp = await client.post("/api/v1/users", json={
        "email": "doc@example.com",
        "full_name": "Doctor One",
        "role": "doctor",
        "password": "docpass123",
        "agency_id": str(agency.id)
    }, headers={"Authorization": f"Bearer {token}"})

    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "doc@example.com"
    assert data["role"] == "doctor"
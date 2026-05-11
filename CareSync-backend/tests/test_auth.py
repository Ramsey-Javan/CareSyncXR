import pytest
from httpx import AsyncClient
from app.main import app
from app.database import AsyncSessionLocal, Base, engine
from app.models.user import User
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

async def test_login_success(client):
    # Create a user
    async with AsyncSessionLocal() as db:
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
            role="admin"
        )
        db.add(user)
        await db.commit()

    response = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

async def test_login_invalid_password(client):
    async with AsyncSessionLocal() as db:
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
            role="admin"
        )
        db.add(user)
        await db.commit()

    response = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401
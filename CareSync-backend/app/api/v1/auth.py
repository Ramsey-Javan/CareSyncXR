from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, RegisterRequest, RegisterResponse
from app.core.auth import verify_password, create_access_token, generate_refresh_token, decode_token, get_password_hash
from app.utils.token_hash import hash_refresh_token
from uuid import UUID

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    allowed_roles = {"patient", "caregiver", "family", "doctor"}
    if payload.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Role not allowed for self-registration")

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        agency_id=payload.agency_id,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    is_super_admin = (new_user.role == "super_admin")
    access_token = create_access_token(new_user.id, new_user.agency_id, new_user.role, is_super_admin)
    raw_refresh = generate_refresh_token()
    hashed_refresh = hash_refresh_token(raw_refresh)
    expires_at = datetime.utcnow() + timedelta(days=7)

    refresh_token_db = RefreshToken(
        user_id=new_user.id,
        token_hash=hashed_refresh,
        expires_at=expires_at,
    )
    db.add(refresh_token_db)
    await db.commit()

    return RegisterResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        access_token=access_token,
        refresh_token=raw_refresh,
    )

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).where(User.email == login_data.email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Determine if super admin
    is_super_admin = (user.role == "super_admin")

    # Create tokens
    access_token = create_access_token(user.id, user.agency_id, user.role, is_super_admin)
    raw_refresh = generate_refresh_token()
    hashed_refresh = hash_refresh_token(raw_refresh)

    # Store refresh token hash
    expires_at = datetime.utcnow() + timedelta(days=7)
    refresh_token_db = RefreshToken(
        user_id=user.id,
        token_hash=hashed_refresh,
        expires_at=expires_at
    )
    db.add(refresh_token_db)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        user_id=str(user.id),
        full_name=user.full_name,
        role=user.role
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # Hash incoming refresh token
    hashed = hash_refresh_token(refresh_req.refresh_token)

    # Find token in DB
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == hashed, RefreshToken.revoked == False))
    token_record = result.scalar_one_or_none()
    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Get user
    user_result = await db.execute(select(User).where(User.id == token_record.user_id, User.is_active == True))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    is_super_admin = (user.role == "super_admin")
    new_access = create_access_token(user.id, user.agency_id, user.role, is_super_admin)

    # Rotate refresh token? Not required for MVP, but we'll issue a new one
    new_raw_refresh = generate_refresh_token()
    new_hashed = hash_refresh_token(new_raw_refresh)
    new_expires = datetime.utcnow() + timedelta(days=7)

    # Revoke old token
    token_record.revoked = True
    # Add new token
    new_token = RefreshToken(user_id=user.id, token_hash=new_hashed, expires_at=new_expires)
    db.add(new_token)
    await db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_raw_refresh,
        user_id=str(user.id),
        full_name=user.full_name,
        role=user.role
    )

@router.post("/logout", status_code=204)
async def logout(refresh_req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    hashed = hash_refresh_token(refresh_req.refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == hashed))
    token_record = result.scalar_one_or_none()
    if token_record:
        token_record.revoked = True
        await db.commit()
    return None
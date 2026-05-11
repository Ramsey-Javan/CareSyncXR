from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.core.auth import verify_password, create_access_token, generate_refresh_token, decode_token
from app.utils.token_hash import hash_refresh_token, verify_refresh_token
from uuid import UUID

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)

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

    return TokenResponse(access_token=new_access, refresh_token=new_raw_refresh)

@router.post("/logout", status_code=204)
async def logout(refresh_req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    hashed = hash_refresh_token(refresh_req.refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == hashed))
    token_record = result.scalar_one_or_none()
    if token_record:
        token_record.revoked = True
        await db.commit()
    return None
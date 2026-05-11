from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.models.agency import Agency
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.dependencies import require_admin, get_agency_id_from_user, get_current_user
from app.core.auth import get_password_hash, generate_refresh_token
from app.core.email import send_welcome_email

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    role: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    agency_id: Optional[UUID] = Depends(get_agency_id_from_user)
):
    query = select(User)
    if admin_user.role != "super_admin":
        # Regular admin sees only users in their agency
        query = query.where(User.agency_id == admin_user.agency_id)
    else:
        if agency_id:  # super admin can filter by agency
            query = query.where(User.agency_id == agency_id)

    if role:
        query = query.where(User.role == role)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Validate role + agency
    if user_data.role == "super_admin":
        if admin_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admin can create super admin")
        agency_id = None
    else:
        if user_data.agency_id is None:
            if admin_user.role == "super_admin":
                raise HTTPException(status_code=400, detail="Agency ID required for non-super-admin users")
            agency_id = admin_user.agency_id  # Regular admin creates users within their agency
        else:
            agency_id = user_data.agency_id
            # If regular admin, ensure they are creating within their own agency
            if admin_user.role != "super_admin" and agency_id != admin_user.agency_id:
                raise HTTPException(status_code=403, detail="Cannot create user outside your agency")

    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name,
        role=user_data.role,
        agency_id=agency_id,
        avatar_url=user_data.avatar_url
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Send welcome email (async fire-and-forget)
    agency_name = None
    if agency_id:
        agency_result = await db.execute(select(Agency).where(Agency.id == agency_id))
        agency = agency_result.scalar_one_or_none()
        if agency:
            agency_name = agency.name
    await send_welcome_email(new_user.email, new_user.full_name, new_user.role, agency_name)

    return new_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Permission: admin or self
    if current_user.role not in ["super_admin", "admin"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Permission: admin or self (but role update only admin)
    if current_user.role not in ["super_admin", "admin"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If regular user updating themselves, cannot change role
    if current_user.id == user_id and current_user.role not in ["super_admin", "admin"] and update_data.role is not None:
        raise HTTPException(status_code=403, detail="Cannot change your own role")

    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: UUID,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting self if you're the last admin? optional for MVP
    await db.delete(user)
    await db.commit()
    return None
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(
        or_(User.username == user_in.username, User.email == user_in.email)
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username atau email sudah terdaftar.",
        )

    first_user_check = await db.execute(select(User.id).limit(1))
    is_first_user = first_user_check.scalar_one_or_none() is None

    has_valid_secret = bool(
        settings.ADMIN_REGISTER_SECRET
        and user_in.admin_secret == settings.ADMIN_REGISTER_SECRET
    )

    is_admin = is_first_user or has_valid_secret

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_admin=is_admin,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    role = "admin" if new_user.is_admin else "user"
    access_token = create_access_token(
        data={"sub": str(new_user.id), "role": role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(
        or_(User.username == user_in.username, User.email == user_in.username)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username/email atau password salah.",
        )

    role = "admin" if user.is_admin else "user"
    access_token = create_access_token(
        data={"sub": str(user.id), "role": role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
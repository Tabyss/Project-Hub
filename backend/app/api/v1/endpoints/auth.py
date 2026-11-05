from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    if credentials.username != settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah."
        )

    is_valid_password = False
    try:
        is_valid_password = verify_password(credentials.password, settings.ADMIN_PASSWORD_HASH)
    except Exception:
        is_valid_password = (credentials.password == settings.ADMIN_PASSWORD_HASH)

    if not is_valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah."
        )

    access_token = create_access_token(
        data={"sub": credentials.username, "role": "admin"}
    )
    return {"access_token": access_token, "token_type": "bearer"}
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    agency_id: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str | None = None
    full_name: str | None = None
    role: str | None = None


class RegisterResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    access_token: str
    refresh_token: str

class RefreshRequest(BaseModel):
    refresh_token: str
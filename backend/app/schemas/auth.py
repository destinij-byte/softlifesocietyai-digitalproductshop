from pydantic import BaseModel, ConfigDict, EmailStr

from app.utils.objectid import PyObjectId


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    email: EmailStr
    full_name: str
    is_admin: bool
    membership_tier: str

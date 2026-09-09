"""Minimal stand-in for the SLS app's existing auth system.

Academy is meant to reuse the app's existing user accounts/auth/subscription
infrastructure rather than a parallel login system. That infrastructure
doesn't live in this repo yet, so this router provides just enough
(register/login issuing a JWT, `users` collection) for Academy's endpoints
to have something real to authenticate against. Swap this out for the
actual SLS auth service instead of building alongside it.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.deps import get_current_user
from app.models.user import UserInDB
from app.schemas.auth import LoginRequest, MeResponse, RegisterRequest, TokenResponse
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    db = get_database()
    existing = await db.users.find_one({"email": payload.email})
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    doc = {
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "full_name": payload.full_name,
        "is_admin": False,
        "membership_tier": "free",
        "subscription_status": "none",
        "subscription_renews_at": None,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_database()
    doc = await db.users.find_one({"email": payload.email})
    if doc is None or not verify_password(payload.password, doc["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = UserInDB(**doc)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
async def get_me(user: UserInDB = Depends(get_current_user)):
    return MeResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        membership_tier=user.membership_tier,
    )

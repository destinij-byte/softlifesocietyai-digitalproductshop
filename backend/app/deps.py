from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database import get_database
from app.models.user import UserInDB
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserInDB:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    user_id = decode_access_token(credentials.credentials)
    if user_id is None or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
    db = get_database()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return UserInDB(**doc)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserInDB | None:
    """Like get_current_user, but for endpoints that are browsable while
    logged out (pricing pages) and only need the user for extras like
    "already subscribed" state - a missing or invalid token just means
    "anonymous visitor", not a 401."""
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    if user_id is None or not ObjectId.is_valid(user_id):
        return None
    db = get_database()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if doc is None:
        return None
    return UserInDB(**doc)


async def get_current_admin(
    user: UserInDB = Depends(get_current_user),
) -> UserInDB:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return user

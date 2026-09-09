from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.objectid import PyObjectId

MembershipTier = Literal["free", "vault_member", "elite", "founding_member"]
SubscriptionStatus = Literal["active", "canceled", "none"]


class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id")
    email: EmailStr
    hashed_password: str
    full_name: str = ""
    is_admin: bool = False
    membership_tier: MembershipTier = "free"
    subscription_status: SubscriptionStatus = "none"
    subscription_renews_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

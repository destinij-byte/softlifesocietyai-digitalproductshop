from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

BoxType = Literal["skincare", "lifestyle"]
BoxTier = Literal["mini", "classic", "deluxe"]
BoxSubscriptionStatus = Literal["active", "canceled"]


class BoxSubscription(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    box_type: BoxType
    tier: BoxTier
    stripe_customer_id: str
    stripe_subscription_id: str
    status: BoxSubscriptionStatus = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    canceled_at: datetime | None = None

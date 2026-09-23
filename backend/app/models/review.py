from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

ReviewStatus = Literal["pending", "approved", "rejected"]


class Review(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    product_id: PyObjectId
    user_id: PyObjectId
    rating: int  # 1-5
    title: str = ""
    body: str = ""
    display_name: str = ""
    verified_purchase: bool = True
    # True only for beta/Founding Reviewers who received the product free in
    # exchange for an honest review - shown to buyers per the FTC disclosure
    # rule, never hidden.
    incentivized: bool = False
    status: ReviewStatus = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

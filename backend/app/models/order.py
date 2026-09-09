from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

OrderItemType = Literal["product", "bundle"]


class OrderItem(BaseModel):
    type: OrderItemType
    product_id: PyObjectId | None = None
    bundle_id: PyObjectId | None = None
    title: str
    price: float


class Order(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    user_id: PyObjectId
    stripe_payment_id: str
    items: list[OrderItem] = Field(default_factory=list)
    amount: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

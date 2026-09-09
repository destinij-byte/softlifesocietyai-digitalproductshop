from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId

ProductType = str  # e.g. "Workbook", "Planner", "Guide", "Prompt Pack", ...

# Catalog collections - each layers its own accent color over the shared
# ivory/cream + gold product template so the catalog reads as one boutique.
ProductCollection = Literal["soft_life", "wealth", "ceo", "ai", "inner_life", "signature"]


class Product(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PyObjectId = Field(alias="_id", default_factory=ObjectId)
    slug: str
    title: str
    subtitle: str = ""
    description: str = ""
    type: ProductType
    collection: ProductCollection = "soft_life"
    credit_line: str = "D. Jones / Soft Life Society"
    price: float
    file_url: str = ""
    thumbnail_url: str = ""
    bundle_ids: list[PyObjectId] = Field(default_factory=list)
    is_ai_resource: bool = False
    is_monthly_drop: bool = False
    is_hero: bool = False
    drop_month: str | None = None  # "YYYY-MM"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

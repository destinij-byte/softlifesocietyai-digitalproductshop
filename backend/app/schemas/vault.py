from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.utils.objectid import PyObjectId


class ProductOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    slug: str
    title: str
    subtitle: str
    description: str
    type: str
    collection: str
    life_area: str
    credit_line: str
    price: float
    thumbnail_url: str
    is_ai_resource: bool
    is_monthly_drop: bool
    is_hero: bool
    drop_month: str | None


class BundleOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    slug: str
    name: str
    description: str
    price: float
    products: list[ProductOut]
    includes_app_access: bool
    is_founding_member: bool
    individual_total: float
    savings: float


class LibraryItemOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    product: ProductOut
    source: str
    granted_at: datetime
    last_opened_at: datetime | None


class DashboardOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    welcome_message: str
    membership_tier: str
    membership_badge: str | None
    library_count: int
    new_this_month: list[ProductOut]
    continue_your_journey: list[LibraryItemOut]


class DropOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    month: str
    products: list[ProductOut]
    unlocked: bool


class OrderItemOut(BaseModel):
    type: str
    title: str
    price: float


class OrderOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    items: list[OrderItemOut]
    amount: float
    created_at: datetime


class CheckoutRequest(BaseModel):
    product_id: str | None = None
    bundle_id: str | None = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class DownloadResponse(BaseModel):
    download_url: str
    expires_in_seconds: int

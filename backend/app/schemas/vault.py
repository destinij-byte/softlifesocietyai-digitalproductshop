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
    best_for: str
    outcome: str
    whats_inside: list[str]
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


class CartItemIn(BaseModel):
    product_id: str | None = None
    bundle_id: str | None = None


class CartCheckoutRequest(BaseModel):
    items: list[CartItemIn] = Field(default_factory=list)


class DownloadResponse(BaseModel):
    download_url: str
    expires_in_seconds: int


class BoxTierOut(BaseModel):
    tier: str
    label: str
    price: int


class BoxOut(BaseModel):
    box_type: str
    label: str
    teaser: str
    tiers: list[BoxTierOut]
    subscribed_tier: str | None


class BoxCheckoutRequest(BaseModel):
    box_type: str
    tier: str


class BoxSubscriberOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: PyObjectId
    email: str
    full_name: str
    box_type: str
    tier: str
    created_at: datetime


class MonthPoint(BaseModel):
    month: str
    value: float


class GrowthOut(BaseModel):
    money: list[MonthPoint]
    goals: list[MonthPoint]
    wellness: list[MonthPoint]


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = ""
    body: str = ""
    display_name: str = ""


class ReviewOut(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: PyObjectId
    rating: int
    title: str
    body: str
    display_name: str
    verified_purchase: bool
    incentivized: bool
    created_at: datetime


class ProductReviewsOut(BaseModel):
    average_rating: float | None
    count: int
    reviews: list[ReviewOut]

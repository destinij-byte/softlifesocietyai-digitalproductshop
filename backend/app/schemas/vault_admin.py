from pydantic import BaseModel

from app.models.product import ProductCollection


class ProductCreate(BaseModel):
    slug: str
    title: str
    subtitle: str = ""
    description: str = ""
    type: str
    collection: ProductCollection = "soft_life"
    credit_line: str = "D. Jones / Soft Life Society"
    price: float
    file_url: str = ""
    thumbnail_url: str = ""
    is_ai_resource: bool = False
    is_monthly_drop: bool = False
    is_hero: bool = False
    drop_month: str | None = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    type: str | None = None
    collection: ProductCollection | None = None
    credit_line: str | None = None
    price: float | None = None
    file_url: str | None = None
    thumbnail_url: str | None = None
    is_ai_resource: bool | None = None
    is_monthly_drop: bool | None = None
    is_hero: bool | None = None
    drop_month: str | None = None
    is_active: bool | None = None


class BundleCreate(BaseModel):
    slug: str
    name: str
    description: str = ""
    price: float
    product_ids: list[str] = []
    includes_app_access: bool = False
    is_founding_member: bool = False
    is_active: bool = True


class BundleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    product_ids: list[str] | None = None
    includes_app_access: bool | None = None
    is_founding_member: bool | None = None
    is_active: bool | None = None

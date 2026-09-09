from pydantic import BaseModel


class ProductCreate(BaseModel):
    slug: str
    title: str
    description: str = ""
    type: str
    price: float
    file_url: str = ""
    thumbnail_url: str = ""
    is_ai_resource: bool = False
    is_monthly_drop: bool = False
    drop_month: str | None = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    price: float | None = None
    file_url: str | None = None
    thumbnail_url: str | None = None
    is_ai_resource: bool | None = None
    is_monthly_drop: bool | None = None
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

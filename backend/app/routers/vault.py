from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.config import settings
from app.database import get_database
from app.deps import get_current_user
from app.models.bundle import Bundle
from app.models.product import Product
from app.models.user import UserInDB
from app.schemas.vault import (
    BoxCheckoutRequest,
    BoxOut,
    BoxTierOut,
    BundleOut,
    CheckoutRequest,
    CheckoutResponse,
    DashboardOut,
    DownloadResponse,
    DropOut,
    LibraryItemOut,
    OrderItemOut,
    OrderOut,
    ProductOut,
)
from app.services import box_service, entitlement_service
from app.services.stripe_service import construct_webhook_event
from app.services.vault_download_service import sign_download_url
from app.services.vault_stripe_service import (
    create_checkout_session_for_bundle,
    create_checkout_session_for_product,
)

router = APIRouter(prefix="/vault", tags=["vault"])

MEMBERSHIP_BADGES: dict[str, str] = {
    "founding_member": "👑 Founding Member — she was here first.",
    "elite": "✨ Elite Member",
    "vault_member": "💗 Vault Member",
}


def _oid(id_str: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {field_name}")
    return ObjectId(id_str)


def _product_out(doc: dict) -> ProductOut:
    return ProductOut(
        id=doc["_id"],
        slug=doc["slug"],
        title=doc["title"],
        subtitle=doc.get("subtitle", ""),
        description=doc.get("description", ""),
        type=doc["type"],
        collection=doc.get("collection", "soft_life"),
        life_area=doc.get("life_area", "soft_life"),
        credit_line=doc.get("credit_line", "D. Jones / Soft Life Society"),
        price=doc["price"],
        thumbnail_url=doc.get("thumbnail_url", ""),
        is_ai_resource=doc.get("is_ai_resource", False),
        is_monthly_drop=doc.get("is_monthly_drop", False),
        is_hero=doc.get("is_hero", False),
        drop_month=doc.get("drop_month"),
    )


async def _find_product(db, id_or_slug: str) -> dict:
    query = {"_id": ObjectId(id_or_slug)} if ObjectId.is_valid(id_or_slug) else {"slug": id_or_slug}
    doc = await db.products.find_one({**query, "is_active": True})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return doc


async def _find_bundle(db, id_or_slug: str) -> dict:
    query = {"_id": ObjectId(id_or_slug)} if ObjectId.is_valid(id_or_slug) else {"slug": id_or_slug}
    doc = await db.bundles.find_one({**query, "is_active": True})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found")
    return doc


async def _build_bundle_out(db, bundle_doc: dict) -> BundleOut:
    product_docs = await db.products.find({"_id": {"$in": bundle_doc.get("product_ids", [])}}).to_list(length=None)
    products_out = [_product_out(doc) for doc in product_docs]
    individual_total = sum(doc["price"] for doc in product_docs)
    return BundleOut(
        id=bundle_doc["_id"],
        slug=bundle_doc["slug"],
        name=bundle_doc["name"],
        description=bundle_doc.get("description", ""),
        price=bundle_doc["price"],
        products=products_out,
        includes_app_access=bundle_doc.get("includes_app_access", False),
        is_founding_member=bundle_doc.get("is_founding_member", False),
        individual_total=individual_total,
        savings=round(individual_total - bundle_doc["price"], 2),
    )


# --- Public catalog -----------------------------------------------------


@router.get("/products", response_model=list[ProductOut])
async def list_products(type: str | None = Query(default=None)):
    db = get_database()
    query: dict = {"is_active": True}
    if type:
        query["type"] = type
    docs = await db.products.find(query).to_list(length=None)
    return [_product_out(doc) for doc in docs]


@router.get("/products/{id_or_slug}", response_model=ProductOut)
async def get_product(id_or_slug: str):
    db = get_database()
    doc = await _find_product(db, id_or_slug)
    return _product_out(doc)


@router.get("/bundles", response_model=list[BundleOut])
async def list_bundles():
    db = get_database()
    docs = await db.bundles.find({"is_active": True}).to_list(length=None)
    return [await _build_bundle_out(db, doc) for doc in docs]


@router.get("/bundles/{id_or_slug}", response_model=BundleOut)
async def get_bundle(id_or_slug: str):
    db = get_database()
    doc = await _find_bundle(db, id_or_slug)
    return await _build_bundle_out(db, doc)


# --- Checkout + webhook ---------------------------------------------------


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(payload: CheckoutRequest, user: UserInDB = Depends(get_current_user)):
    if not payload.product_id and not payload.bundle_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="product_id or bundle_id is required")
    if payload.product_id and payload.bundle_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pass only one of product_id or bundle_id")

    db = get_database()

    if payload.product_id:
        product_doc = await _find_product(db, payload.product_id)
        if await entitlement_service.has_product_access(db, user.id, product_doc["_id"], is_admin=user.is_admin):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already unlocked, babe")
        session = create_checkout_session_for_product(Product(**product_doc), user)
    else:
        bundle_doc = await _find_bundle(db, payload.bundle_id)
        session = create_checkout_session_for_bundle(Bundle(**bundle_doc), user)

    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


# --- The Box (monthly subscription boxes) ---------------------------------


@router.get("/boxes", response_model=list[BoxOut])
async def list_boxes(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    subs = await db.box_subscriptions.find({"user_id": user.id, "status": "active"}).to_list(length=None)
    subscribed_by_type = {sub["box_type"]: sub["tier"] for sub in subs}

    return [
        BoxOut(
            box_type=box_type,
            label=box["label"],
            teaser=box["teaser"],
            tiers=[
                BoxTierOut(
                    tier=tier,
                    label=box_service.BOX_TIERS[tier]["label"],
                    price_low=box_service.BOX_TIERS[tier]["price_low"],
                    price_high=box_service.BOX_TIERS[tier]["price_high"],
                )
                for tier in box_service.TIER_ORDER
            ],
            subscribed_tier=subscribed_by_type.get(box_type),
        )
        for box_type, box in box_service.BOX_TYPES.items()
    ]


@router.post("/boxes/checkout", response_model=CheckoutResponse)
async def create_box_checkout(payload: BoxCheckoutRequest, user: UserInDB = Depends(get_current_user)):
    if payload.box_type not in box_service.BOX_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown box type")
    if payload.tier not in box_service.BOX_TIERS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown tier")

    db = get_database()
    existing = await db.box_subscriptions.find_one(
        {"user_id": user.id, "box_type": payload.box_type, "status": "active"}
    )
    if existing and existing["tier"] == payload.tier:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already subscribed to this box, babe")

    session = box_service.create_box_checkout_session(payload.box_type, payload.tier, user)
    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


@router.post("/webhook/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = construct_webhook_event(payload, sig_header)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        if metadata.get("kind") in ("product", "bundle"):
            await _fulfill_order(session, metadata)
        elif metadata.get("kind") == "box_subscription":
            await _fulfill_box_subscription(session, metadata)
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await get_database().box_subscriptions.update_one(
            {"stripe_subscription_id": subscription["id"]},
            {"$set": {"status": "canceled", "canceled_at": datetime.now(timezone.utc)}},
        )

    return {"received": True}


async def _fulfill_box_subscription(session: dict, metadata: dict) -> None:
    db = get_database()
    user_id = ObjectId(metadata["user_id"])
    box_type = metadata["box_type"]
    tier = metadata["tier"]

    await db.box_subscriptions.update_one(
        {"user_id": user_id, "box_type": box_type},
        {
            "$set": {
                "user_id": user_id,
                "box_type": box_type,
                "tier": tier,
                "stripe_customer_id": session.get("customer") or "",
                "stripe_subscription_id": session.get("subscription") or "",
                "status": "active",
                "canceled_at": None,
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
        },
        upsert=True,
    )


async def _fulfill_order(session: dict, metadata: dict) -> None:
    db = get_database()

    stripe_payment_id = session.get("payment_intent") or session["id"]
    if await db.orders.find_one({"stripe_payment_id": stripe_payment_id}):
        return  # already fulfilled

    user_id = ObjectId(metadata["user_id"])
    amount = (session.get("amount_total") or 0) / 100
    now = datetime.now(timezone.utc)

    if metadata["kind"] == "product":
        product_id = ObjectId(metadata["product_id"])
        product_doc = await db.products.find_one({"_id": product_id})
        if product_doc is None:
            return
        await entitlement_service.grant_product_entitlement(db, user_id, product_id)
        items = [{"type": "product", "product_id": product_id, "bundle_id": None, "title": product_doc["title"], "price": product_doc["price"]}]
    else:
        bundle_id = ObjectId(metadata["bundle_id"])
        bundle_doc = await db.bundles.find_one({"_id": bundle_id})
        if bundle_doc is None:
            return
        await entitlement_service.grant_bundle(db, user_id, bundle_doc)
        items = [{"type": "bundle", "product_id": None, "bundle_id": bundle_id, "title": bundle_doc["name"], "price": bundle_doc["price"]}]

    await db.orders.insert_one(
        {
            "user_id": user_id,
            "stripe_payment_id": stripe_payment_id,
            "items": items,
            "amount": amount,
            "created_at": now,
        }
    )


# --- Dashboard / library / drops (auth) -----------------------------------


@router.get("/dashboard", response_model=DashboardOut)
async def get_dashboard(user: UserInDB = Depends(get_current_user)):
    db = get_database()

    owned_ids = await entitlement_service.owned_product_ids(db, user.id, is_admin=user.is_admin)
    library_count = len(owned_ids)

    latest_drop = await db.products.find_one({"is_monthly_drop": True}, sort=[("drop_month", -1)])
    new_this_month: list[ProductOut] = []
    if latest_drop is not None:
        drop_docs = await db.products.find(
            {"is_monthly_drop": True, "drop_month": latest_drop["drop_month"]}
        ).to_list(length=None)
        new_this_month = [_product_out(doc) for doc in drop_docs]

    recent_entitlements = (await entitlement_service.list_library_entitlements(db, user.id, is_admin=user.is_admin))[:6]
    continue_journey: list[LibraryItemOut] = []
    for ent in recent_entitlements:
        product_doc = await db.products.find_one({"_id": ent["product_id"]})
        if product_doc is None:
            continue
        continue_journey.append(
            LibraryItemOut(
                product=_product_out(product_doc),
                source=ent["source"],
                granted_at=ent["granted_at"],
                last_opened_at=ent.get("last_opened_at"),
            )
        )

    first_name = user.full_name.split(" ")[0] if user.full_name else ""
    welcome_message = (
        f"Welcome back, {first_name}. Your Society missed you." if first_name else "Welcome back, boss. Your Society missed you."
    )

    return DashboardOut(
        welcome_message=welcome_message,
        membership_tier=user.membership_tier,
        membership_badge=MEMBERSHIP_BADGES.get(user.membership_tier),
        library_count=library_count,
        new_this_month=new_this_month,
        continue_your_journey=continue_journey,
    )


@router.get("/library", response_model=list[LibraryItemOut])
async def get_library(
    type: str | None = Query(default=None),
    life_area: str | None = Query(default=None),
    user: UserInDB = Depends(get_current_user),
):
    db = get_database()
    entitlements = await entitlement_service.list_library_entitlements(db, user.id, is_admin=user.is_admin)

    results: list[LibraryItemOut] = []
    for ent in entitlements:
        product_doc = await db.products.find_one({"_id": ent["product_id"]})
        if product_doc is None:
            continue
        if type and product_doc.get("type") != type:
            continue
        if life_area and product_doc.get("life_area") != life_area:
            continue
        results.append(
            LibraryItemOut(
                product=_product_out(product_doc),
                source=ent["source"],
                granted_at=ent["granted_at"],
                last_opened_at=ent.get("last_opened_at"),
            )
        )
    return results


def _drop_unlocked(user: UserInDB, product_id: ObjectId, owned_ids: set[ObjectId]) -> bool:
    if product_id in owned_ids:
        return True
    if user.membership_tier == "founding_member":
        return True
    if user.membership_tier in ("vault_member", "elite") and user.subscription_status == "active":
        return True
    return False


@router.get("/drops", response_model=list[DropOut])
async def get_drops(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    owned_ids = await entitlement_service.owned_product_ids(db, user.id, is_admin=user.is_admin)

    docs = await db.products.find({"is_monthly_drop": True}).sort("drop_month", -1).to_list(length=None)
    by_month: dict[str, list[dict]] = {}
    for doc in docs:
        by_month.setdefault(doc["drop_month"], []).append(doc)

    drops: list[DropOut] = []
    for month in sorted(by_month.keys(), reverse=True):
        month_docs = by_month[month]
        unlocked = all(_drop_unlocked(user, doc["_id"], owned_ids) for doc in month_docs)
        drops.append(DropOut(month=month, products=[_product_out(doc) for doc in month_docs], unlocked=unlocked))
    return drops


@router.post("/products/{product_id}/open", status_code=status.HTTP_204_NO_CONTENT)
async def open_product(product_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    pid = _oid(product_id, "product_id")
    if not await entitlement_service.has_product_access(db, user.id, pid, is_admin=user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This one's for Vault members only")
    await entitlement_service.mark_opened(db, user.id, pid)


@router.get("/products/{product_id}/download", response_model=DownloadResponse)
async def download_product(product_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    pid = _oid(product_id, "product_id")
    if not await entitlement_service.has_product_access(db, user.id, pid, is_admin=user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This one's for Vault members only")

    product_doc = await db.products.find_one({"_id": pid})
    if product_doc is None or not product_doc.get("file_url"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not available")

    await entitlement_service.mark_opened(db, user.id, pid)
    signed_url = sign_download_url(str(pid), product_doc["file_url"])
    return DownloadResponse(download_url=signed_url, expires_in_seconds=settings.vault_download_expire_seconds)


@router.get("/orders", response_model=list[OrderOut])
async def get_orders(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    docs = await db.orders.find({"user_id": user.id}).sort("created_at", -1).to_list(length=None)
    return [
        OrderOut(
            id=doc["_id"],
            items=[OrderItemOut(type=item["type"], title=item["title"], price=item["price"]) for item in doc["items"]],
            amount=doc["amount"],
            created_at=doc["created_at"],
        )
        for doc in docs
    ]

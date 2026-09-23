from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import get_database
from app.deps import get_current_admin
from app.models.user import UserInDB
from app.schemas.vault import BoxSubscriberOut
from app.schemas.vault_admin import (
    AdminOrderOut,
    AdminReviewOut,
    AdminUserOut,
    BundleCreate,
    BundleUpdate,
    ProductCreate,
    ProductUpdate,
    ReviewStatusUpdate,
)

router = APIRouter(prefix="/vault/admin", tags=["vault-admin"])


def _oid(id_str: str) -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")
    return ObjectId(id_str)


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    if await db.products.find_one({"slug": payload.slug}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["bundle_ids"] = []
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.products.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.patch("/products/{product_id}")
async def update_product(product_id: str, payload: ProductUpdate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)

    result = await db.products.update_one({"_id": _oid(product_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return {"updated": True}


@router.post("/bundles", status_code=status.HTTP_201_CREATED)
async def create_bundle(payload: BundleCreate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    if await db.bundles.find_one({"slug": payload.slug}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    product_ids = [_oid(pid) for pid in payload.product_ids]
    existing_count = await db.products.count_documents({"_id": {"$in": product_ids}})
    if existing_count != len(product_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more product_ids not found")

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["product_ids"] = product_ids
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.bundles.insert_one(doc)
    await db.products.update_many({"_id": {"$in": product_ids}}, {"$addToSet": {"bundle_ids": result.inserted_id}})
    return {"id": str(result.inserted_id)}


@router.patch("/bundles/{bundle_id}")
async def update_bundle(bundle_id: str, payload: BundleUpdate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "product_ids" in update:
        update["product_ids"] = [_oid(pid) for pid in update["product_ids"]]
    update["updated_at"] = datetime.now(timezone.utc)

    result = await db.bundles.update_one({"_id": _oid(bundle_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found")
    return {"updated": True}


@router.get("/users", response_model=list[AdminUserOut])
async def list_all_users(_admin: UserInDB = Depends(get_current_admin)):
    """Business/account visibility for the site owner - every user's
    account, membership, and subscription status. Deliberately excludes
    private in-app content (goals, routines, journal entries, Luna chats)."""
    db = get_database()
    docs = await db.users.find({}).sort("created_at", -1).to_list(length=None)
    return [
        AdminUserOut(
            id=doc["_id"],
            email=doc["email"],
            full_name=doc.get("full_name", ""),
            is_admin=doc.get("is_admin", False),
            membership_tier=doc.get("membership_tier", "free"),
            subscription_status=doc.get("subscription_status", "none"),
            created_at=doc["created_at"],
        )
        for doc in docs
    ]


@router.get("/orders", response_model=list[AdminOrderOut])
async def list_all_orders(_admin: UserInDB = Depends(get_current_admin)):
    """Every order across every user, most recent first - for tracking
    sales without touching any user's private app content."""
    db = get_database()
    orders = await db.orders.find({}).sort("created_at", -1).to_list(length=None)

    user_ids = {order["user_id"] for order in orders}
    users = await db.users.find({"_id": {"$in": list(user_ids)}}).to_list(length=None)
    users_by_id = {u["_id"]: u for u in users}

    results = []
    for order in orders:
        user_doc = users_by_id.get(order["user_id"])
        if user_doc is None:
            continue
        results.append(
            AdminOrderOut(
                id=order["_id"],
                user_id=order["user_id"],
                user_email=user_doc["email"],
                user_full_name=user_doc.get("full_name", ""),
                items=order.get("items", []),
                amount=order["amount"],
                created_at=order["created_at"],
            )
        )
    return results


@router.get("/boxes/subscribers", response_model=list[BoxSubscriberOut])
async def list_box_subscribers(_admin: UserInDB = Depends(get_current_admin)):
    """Active Box subscribers, for manual monthly fulfillment - packing is
    hand-done, no 3PL yet."""
    db = get_database()
    subs = await db.box_subscriptions.find({"status": "active"}).sort("box_type", 1).to_list(length=None)

    user_ids = {sub["user_id"] for sub in subs}
    users = await db.users.find({"_id": {"$in": list(user_ids)}}).to_list(length=None)
    users_by_id = {u["_id"]: u for u in users}

    return [
        BoxSubscriberOut(
            user_id=sub["user_id"],
            email=users_by_id[sub["user_id"]]["email"],
            full_name=users_by_id[sub["user_id"]].get("full_name", ""),
            box_type=sub["box_type"],
            tier=sub["tier"],
            created_at=sub["created_at"],
        )
        for sub in subs
        if sub["user_id"] in users_by_id
    ]


@router.get("/reviews", response_model=list[AdminReviewOut])
async def list_reviews(status_filter: str | None = Query(default=None, alias="status"), _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    query: dict = {"status": status_filter} if status_filter else {}
    docs = await db.reviews.find(query).sort("created_at", -1).to_list(length=None)

    product_ids = {doc["product_id"] for doc in docs}
    products = await db.products.find({"_id": {"$in": list(product_ids)}}).to_list(length=None)
    products_by_id = {p["_id"]: p for p in products}
    user_ids = {doc["user_id"] for doc in docs}
    users = await db.users.find({"_id": {"$in": list(user_ids)}}).to_list(length=None)
    users_by_id = {u["_id"]: u for u in users}

    results = []
    for doc in docs:
        product_doc = products_by_id.get(doc["product_id"])
        user_doc = users_by_id.get(doc["user_id"])
        if product_doc is None or user_doc is None:
            continue
        results.append(
            AdminReviewOut(
                id=doc["_id"],
                product_id=doc["product_id"],
                product_title=product_doc["title"],
                user_email=user_doc["email"],
                rating=doc["rating"],
                title=doc.get("title", ""),
                body=doc.get("body", ""),
                display_name=doc.get("display_name", ""),
                verified_purchase=doc.get("verified_purchase", True),
                incentivized=doc.get("incentivized", False),
                status=doc["status"],
                created_at=doc["created_at"],
            )
        )
    return results


@router.patch("/reviews/{review_id}")
async def update_review_status(review_id: str, payload: ReviewStatusUpdate, _admin: UserInDB = Depends(get_current_admin)):
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status must be 'approved' or 'rejected'")
    db = get_database()
    result = await db.reviews.update_one({"_id": _oid(review_id)}, {"$set": {"status": payload.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return {"updated": True}

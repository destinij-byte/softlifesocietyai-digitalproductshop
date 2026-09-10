from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.deps import get_current_admin
from app.models.user import UserInDB
from app.schemas.vault import BoxSubscriberOut
from app.schemas.vault_admin import BundleCreate, BundleUpdate, ProductCreate, ProductUpdate

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

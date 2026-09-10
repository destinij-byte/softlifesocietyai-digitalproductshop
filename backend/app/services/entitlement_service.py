"""Grants and reads Vault entitlements.

A bundle purchase is expanded into one entitlement per product it contains
(source="bundle", bundle_id set to the bundle that unlocked it) rather than a
single shared entitlement, so ownership checks, per-product download access,
and `last_opened_at` tracking all stay a simple lookup keyed by product_id.
"""

from datetime import datetime, timezone

from bson import ObjectId


async def grant_product_entitlement(
    db, user_id: ObjectId, product_id: ObjectId, source: str = "product", bundle_id: ObjectId | None = None
) -> None:
    existing = await db.entitlements.find_one({"user_id": user_id, "product_id": product_id})
    if existing is not None:
        return
    await db.entitlements.insert_one(
        {
            "user_id": user_id,
            "source": source,
            "product_id": product_id,
            "bundle_id": bundle_id,
            "granted_at": datetime.now(timezone.utc),
            "expires_at": None,
            "last_opened_at": None,
        }
    )


async def grant_bundle(db, user_id: ObjectId, bundle_doc: dict) -> None:
    for product_id in bundle_doc.get("product_ids", []):
        await grant_product_entitlement(db, user_id, product_id, source="bundle", bundle_id=bundle_doc["_id"])
    if bundle_doc.get("is_founding_member"):
        await db.users.update_one({"_id": user_id}, {"$set": {"membership_tier": "founding_member"}})


async def owned_product_ids(db, user_id: ObjectId, is_admin: bool = False) -> set[ObjectId]:
    if is_admin:
        docs = await db.products.find({"is_active": True}, {"_id": 1}).to_list(length=None)
        return {doc["_id"] for doc in docs}
    docs = await db.entitlements.find({"user_id": user_id, "product_id": {"$ne": None}}).to_list(length=None)
    return {doc["product_id"] for doc in docs}


async def has_product_access(db, user_id: ObjectId, product_id: ObjectId, is_admin: bool = False) -> bool:
    if is_admin:
        return True
    doc = await db.entitlements.find_one({"user_id": user_id, "product_id": product_id})
    return doc is not None


async def mark_opened(db, user_id: ObjectId, product_id: ObjectId) -> None:
    await db.entitlements.update_one(
        {"user_id": user_id, "product_id": product_id},
        {"$set": {"last_opened_at": datetime.now(timezone.utc)}},
    )


async def list_library_entitlements(db, user_id: ObjectId, is_admin: bool = False) -> list[dict]:
    """Owned-product entitlements, most-recently-opened first (never-opened last)."""
    if is_admin:
        now = datetime.now(timezone.utc)
        product_docs = await db.products.find({"is_active": True}, {"_id": 1}).to_list(length=None)
        return [
            {"user_id": user_id, "source": "admin", "product_id": doc["_id"], "bundle_id": None, "granted_at": now, "expires_at": None, "last_opened_at": None}
            for doc in product_docs
        ]
    docs = await db.entitlements.find({"user_id": user_id, "product_id": {"$ne": None}}).to_list(length=None)
    docs.sort(key=lambda d: d["last_opened_at"] or d["granted_at"], reverse=True)
    return docs

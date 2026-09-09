"""Seed The Soft Life Vault's 18 individual products, 4 AI Collection monthly
drops, and 4 bundles (Starter / Reset / Full Library / Founding Member
Lifetime), per the pricing table in the project brief.

    python -m app.scripts.seed_vault_products

Idempotent - upserts by slug, safe to re-run.
"""

import asyncio
from datetime import datetime, timezone

from app.database import get_database

PRODUCTS = [
    {"slug": "soft-life-blueprint", "title": "The Soft Life Blueprint", "type": "Workbook", "price": 17},
    {"slug": "soft-life-reset", "title": "The Soft Life Reset", "type": "Workbook", "price": 15},
    {"slug": "that-girl-daily-planner", "title": "That Girl Daily Planner", "type": "Planner", "price": 12},
    {"slug": "30-day-soft-life-challenge", "title": "30-Day Soft Life Challenge", "type": "Challenge Workbook", "price": 14},
    {"slug": "soft-life-morning-routine-guide", "title": "Soft Life Morning Routine Guide", "type": "Guide", "price": 7},
    {"slug": "soft-life-night-routine-guide", "title": "Soft Life Night Routine Guide", "type": "Guide", "price": 7},
    {"slug": "weekly-reset-checklist", "title": "The Weekly Reset Checklist", "type": "Checklist", "price": 5},
    {"slug": "monthly-soft-life-reset", "title": "The Monthly Soft Life Reset", "type": "Planner", "price": 12},
    {"slug": "soft-life-goal-setting-workbook", "title": "Soft Life Goal-Setting Workbook", "type": "Workbook", "price": 15},
    {"slug": "dream-life-vision-planner", "title": "The Dream Life Vision Planner", "type": "Planner", "price": 14},
    {"slug": "soft-life-money-makeover", "title": "Soft Life Money Makeover", "type": "Workbook", "price": 19},
    {"slug": "soft-life-budget-planner", "title": "The Soft Life Budget Planner", "type": "Planner", "price": 14},
    {"slug": "soft-life-ceo-starter-kit", "title": "Soft Life CEO Starter Kit", "type": "Toolkit", "price": 24},
    {"slug": "100-soft-life-ai-prompts", "title": "100 Soft Life AI Prompts", "type": "Prompt Pack", "price": 9, "is_ai_resource": True},
    {"slug": "content-creator-ai-prompt-pack", "title": "Content Creator AI Prompt Pack", "type": "Prompt Pack", "price": 12, "is_ai_resource": True},
    {"slug": "soft-life-journal", "title": "The Soft Life Journal", "type": "Digital Journal", "price": 14},
    {"slug": "affirmations-for-her", "title": "Affirmations for Her", "type": "Affirmation Pack", "price": 6},
    {"slug": "ultimate-soft-life-planner", "title": "The Ultimate Soft Life Planner", "type": "All-in-One", "price": 27},
]

# Future AI Collection additions, seeded as the Vault's Monthly Drops so
# "New This Month" / "Monthly Drops" has real data to show.
AI_COLLECTION_DROPS = [
    {"slug": "ceo-ai-prompt-pack", "title": "CEO AI Prompt Pack", "drop_month": "2026-09"},
    {"slug": "money-ai-prompt-pack", "title": "Money AI Prompt Pack", "drop_month": "2026-08"},
    {"slug": "dating-relationships-ai-prompt-pack", "title": "Dating & Relationships AI Prompt Pack", "drop_month": "2026-07"},
    {"slug": "home-lifestyle-ai-prompt-pack", "title": "Home & Lifestyle AI Prompt Pack", "drop_month": "2026-06"},
]

STARTER_BUNDLE_SLUGS = [
    "soft-life-blueprint",
    "soft-life-reset",
    "that-girl-daily-planner",
    "soft-life-morning-routine-guide",
    "weekly-reset-checklist",
]

RESET_BUNDLE_SLUGS = [
    "soft-life-reset",
    "soft-life-morning-routine-guide",
    "soft-life-night-routine-guide",
    "weekly-reset-checklist",
    "monthly-soft-life-reset",
    "soft-life-goal-setting-workbook",
]

BUNDLES = [
    {
        "slug": "starter-bundle",
        "name": "Starter Bundle",
        "description": "Five essentials to start her soft life era.",
        "price": 27,
        "product_slugs": STARTER_BUNDLE_SLUGS,
    },
    {
        "slug": "reset-bundle",
        "name": "Reset Bundle",
        "description": "Six resources for whenever she needs to hit reset.",
        "price": 47,
        "product_slugs": RESET_BUNDLE_SLUGS,
    },
    {
        "slug": "full-library",
        "name": "Full Library",
        "description": "All 18 products. Every tool, unlocked.",
        "price": 97,
        "product_slugs": [p["slug"] for p in PRODUCTS],
    },
    {
        "slug": "founding-member-lifetime",
        "name": "Founding Member Lifetime",
        "description": "Full Library + app access + Vault + every future drop, forever.",
        "price": 147,
        "product_slugs": [p["slug"] for p in PRODUCTS],
        "includes_app_access": True,
        "is_founding_member": True,
    },
]


async def _upsert_product(db, data: dict) -> None:
    now = datetime.now(timezone.utc)
    doc = {
        "title": data["title"],
        "description": data.get("description", ""),
        "type": data["type"],
        "price": data["price"],
        "file_url": data.get("file_url", f"https://files.softlifesociety.ai/vault/{data['slug']}.pdf"),
        "thumbnail_url": data.get("thumbnail_url", ""),
        "is_ai_resource": data.get("is_ai_resource", False),
        "is_monthly_drop": data.get("is_monthly_drop", False),
        "drop_month": data.get("drop_month"),
        "is_active": True,
        "updated_at": now,
    }
    existing = await db.products.find_one({"slug": data["slug"]})
    if existing:
        await db.products.update_one({"_id": existing["_id"]}, {"$set": doc})
    else:
        doc["slug"] = data["slug"]
        doc["bundle_ids"] = []
        doc["created_at"] = now
        await db.products.insert_one(doc)


async def _upsert_bundle(db, data: dict) -> None:
    now = datetime.now(timezone.utc)
    product_docs = await db.products.find({"slug": {"$in": data["product_slugs"]}}).to_list(length=None)
    product_ids = [doc["_id"] for doc in product_docs]

    doc = {
        "name": data["name"],
        "description": data.get("description", ""),
        "price": data["price"],
        "product_ids": product_ids,
        "includes_app_access": data.get("includes_app_access", False),
        "is_founding_member": data.get("is_founding_member", False),
        "is_active": True,
        "updated_at": now,
    }
    existing = await db.bundles.find_one({"slug": data["slug"]})
    if existing:
        bundle_id = existing["_id"]
        await db.bundles.update_one({"_id": bundle_id}, {"$set": doc})
    else:
        doc["slug"] = data["slug"]
        doc["created_at"] = now
        result = await db.bundles.insert_one(doc)
        bundle_id = result.inserted_id

    await db.products.update_many({"_id": {"$in": product_ids}}, {"$addToSet": {"bundle_ids": bundle_id}})


async def run() -> None:
    db = get_database()

    for product in PRODUCTS:
        await _upsert_product(db, product)
    for drop in AI_COLLECTION_DROPS:
        await _upsert_product(
            db,
            {**drop, "type": "Prompt Pack", "price": 12, "is_ai_resource": True, "is_monthly_drop": True},
        )

    for bundle in BUNDLES:
        await _upsert_bundle(db, bundle)

    print(f"Seeded {len(PRODUCTS)} products, {len(AI_COLLECTION_DROPS)} monthly drops, {len(BUNDLES)} bundles.")


if __name__ == "__main__":
    asyncio.run(run())

"""Seed The Soft Life Vault's 18 individual products, 4 AI Collection monthly
drops, and 4 bundles (Starter / Reset / Full Library / Founding Member
Lifetime), per the Production Bible pricing table and phased launch plan in
the project brief.

    python -m app.scripts.seed_vault_products

Idempotent - upserts by slug, safe to re-run.

Phase 1 (is_active=True - sold today): Blueprint, Reset, 30-Day Challenge,
Money Makeover, CEO Starter Kit, 100 AI Prompts, Content Creator AI Prompt
Pack, Ultimate Soft Life Planner.

Phase 2 (is_active=False - drips out later as ongoing monthly content, not
individually purchasable yet): the remaining 10 products. Flip is_active to
true via PATCH /vault/admin/products/{id} as each one releases.
"""

import asyncio
from datetime import datetime, timezone

from app.database import get_database

PRODUCTS = [
    # 🌸 Soft Life Collection (#1-10) - blush + cream + champagne
    {"slug": "soft-life-blueprint", "title": "The Soft Life Blueprint", "subtitle": "Your roadmap to the life you're building.", "type": "Workbook", "collection": "soft_life", "life_area": "soft_life", "price": 17, "is_hero": True},
    {"slug": "soft-life-reset", "title": "The Soft Life Reset", "subtitle": "A clean slate, whenever she needs one.", "type": "Workbook", "collection": "soft_life", "life_area": "soft_life", "price": 19, "is_hero": True},
    {"slug": "that-girl-daily-planner", "title": "That Girl Daily Planner", "subtitle": "Plan her day like the main character.", "type": "Planner", "collection": "soft_life", "life_area": "soft_life", "price": 12, "is_active": False},
    {"slug": "30-day-soft-life-challenge", "title": "30-Day Soft Life Challenge", "subtitle": "30 days to a softer, more intentional life.", "type": "Challenge Workbook", "collection": "soft_life", "life_area": "challenges", "price": 22, "is_hero": True},
    {"slug": "soft-life-morning-routine-guide", "title": "Soft Life Morning Routine Guide", "subtitle": "Start her day like she means it.", "type": "Guide", "collection": "soft_life", "life_area": "soft_life", "price": 9, "is_active": False},
    {"slug": "soft-life-night-routine-guide", "title": "Soft Life Night Routine Guide", "subtitle": "Wind down like the boss she is.", "type": "Guide", "collection": "soft_life", "life_area": "soft_life", "price": 9, "is_active": False},
    {"slug": "weekly-reset-checklist", "title": "The Weekly Reset Checklist", "subtitle": "Sunday reset, simplified.", "type": "Checklist", "collection": "soft_life", "life_area": "soft_life", "price": 7, "is_active": False},
    {"slug": "monthly-soft-life-reset", "title": "The Monthly Soft Life Reset", "subtitle": "A monthly check-in with herself.", "type": "Planner", "collection": "soft_life", "life_area": "soft_life", "price": 12, "is_active": False},
    {"slug": "soft-life-goal-setting-workbook", "title": "Soft Life Goal-Setting Workbook", "subtitle": "Turn her vision into a plan.", "type": "Workbook", "collection": "soft_life", "life_area": "goals", "price": 15, "is_active": False},
    {"slug": "dream-life-vision-planner", "title": "The Dream Life Vision Planner", "subtitle": "Design the life she's dreaming of.", "type": "Planner", "collection": "soft_life", "life_area": "goals", "price": 17, "is_active": False},
    # 💰 Wealth Collection (#11-12) - espresso + cream + champagne
    {"slug": "soft-life-money-makeover", "title": "Soft Life Money Makeover", "subtitle": "A softer way to get her money right.", "type": "Workbook", "collection": "wealth", "life_area": "money", "price": 22, "is_hero": True},
    {"slug": "soft-life-budget-planner", "title": "The Soft Life Budget Planner", "subtitle": "Budgeting, but make it luxe.", "type": "Planner", "collection": "wealth", "life_area": "money", "price": 12, "is_active": False},
    # 👑 CEO Collection (#13) - black + cream + gold
    {"slug": "soft-life-ceo-starter-kit", "title": "Soft Life CEO Starter Kit", "subtitle": "Everything she needs to run her empire.", "type": "Toolkit", "collection": "ceo", "life_area": "ceo_life", "price": 27, "is_hero": True},
    # 🤖 AI Collection (#14-15) - black + ivory + champagne
    {"slug": "100-soft-life-ai-prompts", "title": "100 Soft Life AI Prompts", "subtitle": "100 prompts to think, plan, and create faster.", "type": "Prompt Pack", "collection": "ai", "life_area": "ai", "price": 15, "is_ai_resource": True, "is_hero": True},
    {"slug": "content-creator-ai-prompt-pack", "title": "Content Creator AI Prompt Pack", "subtitle": "AI prompts for the girl building her brand.", "type": "Prompt Pack", "collection": "ai", "life_area": "ai", "price": 19, "is_ai_resource": True, "is_hero": True},
    # 💕 Inner Life Collection (#16-17) - blush + ivory
    {"slug": "soft-life-journal", "title": "The Soft Life Journal", "subtitle": "A private space for her thoughts.", "type": "Digital Journal", "collection": "inner_life", "life_area": "inner_life", "price": 12, "is_active": False},
    {"slug": "affirmations-for-her", "title": "Affirmations for Her", "subtitle": "Words to remind her who she is.", "type": "Affirmation Pack", "collection": "inner_life", "life_area": "inner_life", "price": 7, "is_active": False},
    # 👑 Signature Collection (#18) - black + champagne + ivory - the flagship
    {"slug": "ultimate-soft-life-planner", "title": "The Ultimate Soft Life Planner", "subtitle": "Every tool she needs, in one luxe planner.", "type": "All-in-One", "collection": "signature", "life_area": "goals", "price": 37, "is_hero": True},
]

# Future AI Collection additions, seeded as the Vault's Monthly Drops so
# "New This Month" / "Monthly Drops" has real data to show.
AI_COLLECTION_DROPS = [
    {"slug": "ceo-ai-prompt-pack", "title": "CEO AI Prompt Pack", "subtitle": "Prompts for the boss building her empire.", "life_area": "ai", "drop_month": "2026-09"},
    {"slug": "money-ai-prompt-pack", "title": "Money AI Prompt Pack", "subtitle": "Prompts for getting her money right.", "life_area": "ai", "drop_month": "2026-08"},
    {"slug": "dating-relationships-ai-prompt-pack", "title": "Dating & Relationships AI Prompt Pack", "subtitle": "Prompts for her heart and her boundaries.", "life_area": "ai", "drop_month": "2026-07"},
    {"slug": "home-lifestyle-ai-prompt-pack", "title": "Home & Lifestyle AI Prompt Pack", "subtitle": "Prompts for the life she's building at home.", "life_area": "ai", "drop_month": "2026-06"},
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
        "description": "Five essentials to start her soft life era. A $54 value.",
        "price": 27,
        "product_slugs": STARTER_BUNDLE_SLUGS,
    },
    {
        "slug": "reset-bundle",
        "name": "Reset Bundle",
        "description": "Six resources for whenever she needs to hit reset. A $94 value.",
        "price": 47,
        "product_slugs": RESET_BUNDLE_SLUGS,
    },
    {
        # Launch price - brief calls for $79-$97 at launch, raised to $127
        # later. Adjust here (and in Stripe) when that changes.
        "slug": "full-library",
        "name": "Full Digital Library",
        "description": "All 18 products. Every tool, unlocked. A $270+ value - launch pricing, going up to $127 later.",
        "price": 79,
        "product_slugs": [p["slug"] for p in PRODUCTS],
    },
    {
        # Positioned in marketing copy as a founding membership, but still
        # implemented as the existing one-time purchase + lifetime
        # entitlement - no recurring billing is wired up yet. Revisit once
        # an actual annual price/renewal structure is decided.
        "slug": "founding-member-lifetime",
        "name": "Founding Member",
        "description": "Full Library + app access + AI + Vault + founding-only bonuses, forever. She was here first.",
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
        "subtitle": data.get("subtitle", ""),
        "description": data.get("description", ""),
        "type": data["type"],
        "collection": data.get("collection", "ai"),
        "life_area": data.get("life_area", "ai"),
        "credit_line": data.get("credit_line", "D. Jones / Soft Life Society"),
        "price": data["price"],
        "file_url": data.get("file_url", f"https://files.softlifesociety.ai/vault/{data['slug']}.pdf"),
        "thumbnail_url": data.get("thumbnail_url", ""),
        "is_ai_resource": data.get("is_ai_resource", False),
        "is_monthly_drop": data.get("is_monthly_drop", False),
        "is_hero": data.get("is_hero", False),
        "drop_month": data.get("drop_month"),
        "is_active": data.get("is_active", True),
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

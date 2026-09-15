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
from pathlib import Path

from app.database import get_database

# Real product files live here, named "{slug}.pdf" - only products with a
# file actually present get a working file_url; everything else stays empty
# ("not available yet") rather than pointing at a fake/dead placeholder URL.
STATIC_VAULT_DIR = Path(__file__).resolve().parent.parent / "static" / "vault"

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

# 🤖 AI Collection sub-brand lineups - each shelf on the Shop's AI Collection
# (see web/src/theme/aiShelves.ts) previously mapped to a single prompt pack.
# These are the full product lines for those named shelves, seeded here so
# the shelves show a real catalog instead of one item each. All live in the
# "ai" collection / "ai" life area, matching the existing drops above.
AI_BRAND_PRODUCTS = [
    # 💗 Her New Era AI shelf (alongside existing "dating-relationships-ai-prompt-pack")
    {"slug": "her-new-era-30-day-life-reset", "title": "The 30-Day Life Reset System", "subtitle": "A full month to reset your habits, mindset, and momentum.", "type": "Workbook", "price": 19, "is_hero": True},
    {"slug": "her-new-era-identity-reset", "title": "The Identity & Self-Concept Reset", "subtitle": "A 14-day plan to rebuild how you see yourself.", "type": "Workbook", "price": 17},
    {"slug": "her-new-era-habit-builder", "title": "The Habit & Routine Builder", "subtitle": "Build routines that actually stick.", "type": "Workbook", "price": 17},
    {"slug": "her-new-era-confidence-rebuild", "title": "The Confidence Rebuild System", "subtitle": "A 21-day challenge to rebuild real confidence.", "type": "Challenge Workbook", "price": 19},
    {"slug": "her-new-era-goal-to-action-planner", "title": "The Goal-to-Action Life Planner", "subtitle": "Turn her goals into an actual plan.", "type": "Planner", "price": 17},
    {"slug": "her-new-era-future-self-ai-kit", "title": "The Future Self AI Planning Kit", "subtitle": "AI prompts to plan the next version of her life.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True},
    # 👑 CEO Girl AI shelf (alongside existing "ceo-ai-prompt-pack")
    {"slug": "ceo-girl-idea-finder", "title": "Business Idea Finder + AI Validation Kit", "subtitle": "Find and validate a real business idea with AI.", "type": "Workbook", "price": 19},
    {"slug": "ceo-girl-offer-builder", "title": "The Offer Builder System", "subtitle": "Build an offer people actually want to buy.", "type": "Workbook", "price": 19},
    {"slug": "ceo-girl-ideal-customer-profile", "title": "The Ideal Customer AI Profile Kit", "subtitle": "Know exactly who she's building for.", "type": "Workbook", "price": 15},
    {"slug": "ceo-girl-pricing-calculator", "title": "Digital Product Pricing Calculator + Guide", "subtitle": "Price her digital products with confidence.", "type": "Guide", "price": 15},
    {"slug": "ceo-girl-30-day-launch-system", "title": "The 30-Day Business Launch System", "subtitle": "A day-by-day plan to launch in 30 days.", "type": "Workbook", "price": 22, "is_hero": True},
    {"slug": "ceo-girl-content-marketing-kit", "title": "Small Business Content & Marketing Kit", "subtitle": "Market her small business without the overwhelm.", "type": "Toolkit", "price": 19},
    # 💸 Money Muse AI shelf (alongside existing "money-ai-prompt-pack")
    {"slug": "money-muse-money-reset-workbook", "title": "The Money Reset Workbook", "subtitle": "A full reset on her relationship with money.", "type": "Workbook", "price": 17, "is_hero": True},
    {"slug": "money-muse-ultimate-budget-planner", "title": "The Ultimate Budget Planner", "subtitle": "Budgeting that actually fits her life.", "type": "Planner", "price": 17},
    {"slug": "money-muse-debt-freedom-tracker", "title": "The Debt Freedom Tracker", "subtitle": "Track her path to being debt-free.", "type": "Workbook", "price": 17},
    {"slug": "money-muse-savings-goal-planner", "title": "The Savings Goal Planner", "subtitle": "Plan and track every savings goal.", "type": "Planner", "price": 12},
    {"slug": "money-muse-ai-prompt-pack", "title": "The Money Muse AI Prompt Pack", "subtitle": "AI prompts for getting her money right.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True},
    # 🎬 Creator Muse AI shelf (alongside existing "content-creator-ai-prompt-pack")
    {"slug": "creator-muse-30-day-content-calendar", "title": "The 30-Day Content Calendar", "subtitle": "A full month of content, planned out.", "type": "Workbook", "price": 17, "is_hero": True},
    {"slug": "creator-muse-hooks-templates", "title": "500+ Hooks & Hook Templates", "subtitle": "Never stare at a blank caption box again.", "type": "Guide", "price": 15},
    {"slug": "creator-muse-caption-vault", "title": "The Caption Vault", "subtitle": "Captions ready to copy, paste, and post.", "type": "Guide", "price": 12},
    {"slug": "creator-muse-reels-tiktok-script-pack", "title": "Reels & TikTok Script Pack", "subtitle": "Full hook-body-CTA scripts, ready to film.", "type": "Workbook", "price": 19},
    {"slug": "creator-muse-ai-prompt-pack", "title": "The Creator Muse AI Prompt Pack", "subtitle": "AI prompts for the girl building her brand.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True},
    # 🏡 Home Reset AI shelf (alongside existing "home-lifestyle-ai-prompt-pack")
    {"slug": "home-reset-whole-home-reset", "title": "The Whole Home Reset", "subtitle": "A room-by-room method for resetting her whole home.", "type": "Workbook", "price": 19, "is_hero": True},
    {"slug": "home-reset-declutter-challenge", "title": "The Declutter Challenge", "subtitle": "A 14-day zone-by-zone declutter challenge.", "type": "Challenge Workbook", "price": 15},
    {"slug": "home-reset-cleaning-system", "title": "The Cleaning System", "subtitle": "A daily, weekly, and monthly cleaning rotation.", "type": "Guide", "price": 15},
    {"slug": "home-reset-room-organization-planner", "title": "The Room Organization Planner", "subtitle": "A reusable method for organizing any room.", "type": "Planner", "price": 15},
    {"slug": "home-reset-moving-planner", "title": "The Moving Planner", "subtitle": "From 8 weeks out to move-in day, fully mapped.", "type": "Planner", "price": 17},
    # 🎓 Study Muse AI shelf - new shelf, no existing product yet
    {"slug": "study-muse-ai-schedule-builder", "title": "The AI Study Schedule Builder", "subtitle": "Turn your exam date and subjects into a real schedule with AI.", "type": "Planner", "price": 15, "is_ai_resource": True, "is_hero": True},
    {"slug": "study-muse-exam-prep-system", "title": "The Exam Prep System", "subtitle": "A complete method for walking into any exam prepared.", "type": "Workbook", "price": 17},
    {"slug": "study-muse-30-day-exam-countdown", "title": "The 30-Day Exam Countdown", "subtitle": "A day-by-day structure for the month before your exam.", "type": "Planner", "price": 15},
    {"slug": "study-muse-active-recall-study-kit", "title": "The Active Recall & Study Method Kit", "subtitle": "The research-backed techniques that actually build memory.", "type": "Guide", "price": 15},
    {"slug": "study-muse-finals-week-survival-system", "title": "The Finals Week Survival System", "subtitle": "A triage system for the week everything is due at once.", "type": "Guide", "price": 12},
    {"slug": "study-muse-ai-prompt-kit", "title": "The Study AI Prompt Kit", "subtitle": "Prompts that turn AI into a study partner.", "type": "Prompt Pack", "price": 12, "is_ai_resource": True},
    # 🌴 Florida Property AI shelf - new shelf, vacation-rental hosting angle.
    # General frameworks/systems only, same as every other shelf - no
    # specific tax/legal/licensing claims stated as fact anywhere here.
    # is_active=False on all 6: the lineup (titles/prices) is approved, but
    # unlike the other 33, none of these have actual workbook content or a
    # PDF written yet - flip to True per-product via PATCH /vault/admin/
    # products/{id} once each one is real.
    {"slug": "florida-property-short-term-rental-launch-kit", "title": "The Short-Term Rental Launch Kit", "subtitle": "Everything to set up her first vacation rental the right way.", "type": "Workbook", "price": 19, "is_hero": True, "is_active": False},
    {"slug": "florida-property-host-pricing-revenue-planner", "title": "The Host Pricing & Revenue Planner", "subtitle": "Price her nights with a system, not a guess.", "type": "Planner", "price": 17, "is_active": False},
    {"slug": "florida-property-5-star-guest-experience-playbook", "title": "The 5-Star Guest Experience Playbook", "subtitle": "Turn one-time guests into repeat bookings and reviews.", "type": "Guide", "price": 15, "is_active": False},
    {"slug": "florida-property-systems-turnover-checklist", "title": "The Property Systems & Turnover Checklist", "subtitle": "A repeatable system for every guest turnover.", "type": "Workbook", "price": 17, "is_active": False},
    {"slug": "florida-property-rental-investment-tracker", "title": "The Rental Property Investment Tracker", "subtitle": "Track income, expenses, and ROI on every property.", "type": "Planner", "price": 15, "is_active": False},
    {"slug": "florida-property-ai-prompt-pack", "title": "The Florida Property AI Prompt Pack", "subtitle": "AI prompts for listings, guest messages, and pricing strategy.", "type": "Prompt Pack", "price": 15, "is_ai_resource": True, "is_active": False},
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
        "file_url": data.get("file_url") or (f"local:vault/{data['slug']}.pdf" if (STATIC_VAULT_DIR / f"{data['slug']}.pdf").is_file() else ""),
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
    for product in AI_BRAND_PRODUCTS:
        await _upsert_product(db, {**product, "collection": "ai", "life_area": "ai"})

    for bundle in BUNDLES:
        await _upsert_bundle(db, bundle)

    print(
        f"Seeded {len(PRODUCTS)} products, {len(AI_COLLECTION_DROPS)} monthly drops, "
        f"{len(AI_BRAND_PRODUCTS)} AI brand shelf products, {len(BUNDLES)} bundles."
    )


if __name__ == "__main__":
    asyncio.run(run())

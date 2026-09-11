"""Seed the 5 Challenge templates from the build brief - 75/45/30 Day (pick
an intensity when joining) plus the fixed-intensity Water Intake and 10,000
Steps Daily challenges. Idempotent - upserts by slug, safe to re-run."""

from datetime import datetime, timezone

from app.database import get_database

TEMPLATES = [
    {"slug": "75-day", "name": "75 Day Challenge", "duration_days": 75, "requires_intensity": True, "emoji": "🔥"},
    {"slug": "45-day", "name": "45 Day Challenge", "duration_days": 45, "requires_intensity": True, "emoji": "🔥"},
    {"slug": "30-day", "name": "30 Day Challenge", "duration_days": 30, "requires_intensity": True, "emoji": "🔥"},
    {"slug": "water-intake", "name": "Water Intake", "duration_days": 0, "requires_intensity": False, "emoji": "💧"},
    {"slug": "10000-steps", "name": "10,000 Steps Daily", "duration_days": 0, "requires_intensity": False, "emoji": "👟"},
]


async def run() -> None:
    db = get_database()
    now = datetime.now(timezone.utc)
    for template in TEMPLATES:
        await db.challenge_templates.update_one(
            {"slug": template["slug"]},
            {"$set": {**template, "is_active": True, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )

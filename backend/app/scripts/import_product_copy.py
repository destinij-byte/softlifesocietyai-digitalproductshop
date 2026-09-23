"""One-time import of product copy (description/best_for/outcome) plus two
subtitle corrections, from soft-life-assets/data/product-copy.json (project
root).

    python -m app.scripts.import_product_copy            # dry run (default)
    python -m app.scripts.import_product_copy --apply     # writes for real

Matches by slug only - never touches title, price, or slug. Only updates a
field when the new value actually differs from what's stored, so re-running
after a partial apply is safe. Prints a table of every change either way;
--apply is required to actually write.
"""

import argparse
import asyncio
import json
from pathlib import Path

from app.database import get_database

DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "soft-life-assets" / "data" / "product-copy.json"

COPY_FIELDS = ["description", "best_for", "outcome"]

SUBTITLE_OVERRIDES = {
    "money-muse-ai-prompt-pack": "AI prompts for building long-term wealth.",
    "creator-muse-ai-prompt-pack": "AI prompts for turning her content into a brand.",
}


async def run(apply: bool) -> None:
    entries = json.loads(DATA_PATH.read_text())
    db = get_database()

    changes = []
    missing_slugs = []

    for entry in entries:
        slug = entry["slug"]
        doc = await db.products.find_one({"slug": slug})
        if doc is None:
            missing_slugs.append(slug)
            continue

        update: dict[str, str] = {}
        for field in COPY_FIELDS:
            new_value = entry.get(field, "")
            old_value = doc.get(field, "")
            if new_value and new_value != old_value:
                update[field] = new_value

        if slug in SUBTITLE_OVERRIDES:
            new_subtitle = SUBTITLE_OVERRIDES[slug]
            if new_subtitle != doc.get("subtitle", ""):
                update["subtitle"] = new_subtitle

        if update:
            changes.append((slug, doc, update))

    print(f"{len(entries)} entries in product-copy.json, {len(changes)} products have changes to apply.\n")
    if missing_slugs:
        print(f"WARNING - slugs in product-copy.json not found in the database: {missing_slugs}\n")

    for slug, doc, update in changes:
        print(f"- {slug} ({doc.get('title', '?')})")
        for field, new_value in update.items():
            old_value = doc.get(field, "") or "(empty)"
            preview_old = old_value if len(old_value) <= 60 else old_value[:57] + "..."
            preview_new = new_value if len(new_value) <= 60 else new_value[:57] + "..."
            print(f"    {field}: {preview_old!r} -> {preview_new!r}")

    if not apply:
        print("\nDry run only - no changes written. Re-run with --apply to write these.")
        return

    for slug, _doc, update in changes:
        await db.products.update_one({"slug": slug}, {"$set": update})
    print(f"\nApplied updates to {len(changes)} products.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write changes for real (default is dry run)")
    args = parser.parse_args()
    asyncio.run(run(apply=args.apply))

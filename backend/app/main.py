from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_database
from app.routers import academy, academy_admin, auth, luna, vault, vault_admin
from app.scripts import seed_challenge_templates, seed_vault_products

app = FastAPI(title="Soft Life Society API")

if settings.cors_allowed_origins_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router)
app.include_router(academy.router)
app.include_router(academy_admin.router)
app.include_router(vault.router)
app.include_router(vault_admin.router)
app.include_router(luna.router)


@app.on_event("startup")
async def create_indexes():
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.courses.create_index("slug", unique=True)
    await db.courses.create_index("status")
    await db.modules.create_index("course_id")
    await db.lessons.create_index("module_id")
    await db.enrollments.create_index([("user_id", 1), ("course_id", 1)], unique=True)
    await db.email_triggers.create_index([("user_id", 1), ("course_id", 1), ("trigger_type", 1)])

    await db.products.create_index("slug", unique=True)
    await db.products.create_index([("is_monthly_drop", 1), ("drop_month", 1)])
    await db.bundles.create_index("slug", unique=True)
    await db.entitlements.create_index([("user_id", 1), ("product_id", 1)], unique=True)
    await db.orders.create_index("stripe_payment_id", unique=True)
    await db.orders.create_index("user_id")
    await db.box_subscriptions.create_index([("user_id", 1), ("box_type", 1)], unique=True)

    await db.goals.create_index("user_id")
    await db.routine_templates.create_index([("user_id", 1), ("type", 1)], unique=True)
    await db.routine_completions.create_index([("user_id", 1), ("type", 1), ("date", 1)], unique=True)
    await db.challenge_templates.create_index("slug", unique=True)
    await db.challenge_participants.create_index([("user_id", 1), ("template_id", 1)], unique=True)
    await db.challenge_logs.create_index([("participant_id", 1), ("date", 1)], unique=True)
    await db.friend_invites.create_index("code", unique=True)
    await db.friendships.create_index([("user_id", 1), ("friend_id", 1)], unique=True)
    await db.food_logs.create_index([("user_id", 1), ("date", 1)])

    # Idempotent (upserts by slug) - keeps the Vault catalog and Challenge
    # templates in sync with the code on every boot instead of relying on
    # someone remembering to run the seed script by hand against production.
    await seed_vault_products.run()
    await seed_challenge_templates.run()


@app.get("/health")
async def health():
    return {"status": "ok"}

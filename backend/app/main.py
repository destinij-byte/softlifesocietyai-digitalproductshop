from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_database
from app.routers import academy, academy_admin, auth, vault, vault_admin
from app.scripts import seed_vault_products

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

    # Idempotent (upserts by slug) - keeps the Vault catalog in sync with the
    # code on every boot instead of relying on someone remembering to run the
    # seed script by hand against production.
    await seed_vault_products.run()


@app.get("/health")
async def health():
    return {"status": "ok"}

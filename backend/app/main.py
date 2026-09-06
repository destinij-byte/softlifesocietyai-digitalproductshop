from fastapi import FastAPI

from app.database import get_database
from app.routers import academy, academy_admin, auth

app = FastAPI(title="Soft Life Society API")

app.include_router(auth.router)
app.include_router(academy.router)
app.include_router(academy_admin.router)


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


@app.get("/health")
async def health():
    return {"status": "ok"}

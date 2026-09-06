from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_database
from app.deps import get_current_admin
from app.models.user import UserInDB
from app.schemas.academy_admin import CourseCreate, CourseUpdate, LessonCreate, ModuleCreate

router = APIRouter(prefix="/academy/admin", tags=["academy-admin"])


def _oid(id_str: str) -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")
    return ObjectId(id_str)


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(payload: CourseCreate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    if await db.courses.find_one({"slug": payload.slug}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    if doc.get("recommended_next_course_id"):
        doc["recommended_next_course_id"] = _oid(doc["recommended_next_course_id"])
    doc["modules"] = []
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.courses.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.patch("/courses/{course_id}")
async def update_course(course_id: str, payload: CourseUpdate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "recommended_next_course_id" in update:
        update["recommended_next_course_id"] = _oid(update["recommended_next_course_id"])
    update["updated_at"] = datetime.now(timezone.utc)

    result = await db.courses.update_one({"_id": _oid(course_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return {"updated": True}


@router.post("/modules", status_code=status.HTTP_201_CREATED)
async def create_module(payload: ModuleCreate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    course_id = _oid(payload.course_id)
    if not await db.courses.find_one({"_id": course_id}):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    doc = {"course_id": course_id, "order": payload.order, "title": payload.title, "lessons": []}
    result = await db.modules.insert_one(doc)
    await db.courses.update_one({"_id": course_id}, {"$push": {"modules": result.inserted_id}})
    return {"id": str(result.inserted_id)}


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
async def create_lesson(payload: LessonCreate, _admin: UserInDB = Depends(get_current_admin)):
    db = get_database()
    module_id = _oid(payload.module_id)
    if not await db.modules.find_one({"_id": module_id}):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    doc = {
        "module_id": module_id,
        "order": payload.order,
        "title": payload.title,
        "video_url": payload.video_url,
        "duration_seconds": payload.duration_seconds,
        "transcript": payload.transcript,
        "resources": [r.model_dump() for r in payload.resources],
    }
    result = await db.lessons.insert_one(doc)
    await db.modules.update_one({"_id": module_id}, {"$push": {"lessons": result.inserted_id}})
    return {"id": str(result.inserted_id)}

from datetime import datetime, timezone

from bson import ObjectId

from app.database import get_database
from app.services.email_service import has_sent_trigger, trigger_academy_email


async def _course_lesson_ids(db, course_id: ObjectId) -> list[ObjectId]:
    modules = await db.modules.find({"course_id": course_id}).to_list(length=None)
    lesson_ids: list[ObjectId] = []
    for module in modules:
        lesson_ids.extend(module.get("lessons", []))
    return lesson_ids


async def _next_lesson_id(db, course_id: ObjectId, completed_lesson_id: ObjectId) -> ObjectId | None:
    modules = await db.modules.find({"course_id": course_id}).sort("order", 1).to_list(length=None)
    ordered_lesson_ids: list[ObjectId] = []
    for module in modules:
        module_lessons = await db.lessons.find({"_id": {"$in": module.get("lessons", [])}}).sort(
            "order", 1
        ).to_list(length=None)
        ordered_lesson_ids.extend(lesson["_id"] for lesson in module_lessons)

    if completed_lesson_id not in ordered_lesson_ids:
        return None
    idx = ordered_lesson_ids.index(completed_lesson_id)
    if idx + 1 < len(ordered_lesson_ids):
        return ordered_lesson_ids[idx + 1]
    return None


async def mark_lesson_complete(user_id: ObjectId, lesson_id: ObjectId) -> dict:
    db = get_database()

    lesson = await db.lessons.find_one({"_id": lesson_id})
    if lesson is None:
        raise ValueError("Lesson not found")

    module = await db.modules.find_one({"_id": lesson["module_id"]})
    if module is None:
        raise ValueError("Module not found")

    course_id = module["course_id"]
    enrollment = await db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if enrollment is None:
        raise PermissionError("User is not enrolled in this course")

    lessons_completed: list[ObjectId] = enrollment["progress"].get("lessons_completed", [])
    if lesson_id not in lessons_completed:
        lessons_completed.append(lesson_id)

    all_lesson_ids = await _course_lesson_ids(db, course_id)
    total = len(all_lesson_ids) or 1
    percent_complete = round(len(lessons_completed) / total * 100, 2)

    next_lesson_id = await _next_lesson_id(db, course_id, lesson_id)
    now = datetime.now(timezone.utc)

    update = {
        "progress.lessons_completed": lessons_completed,
        "progress.percent_complete": percent_complete,
        "progress.current_lesson_id": next_lesson_id,
        "last_activity_at": now,
    }

    just_completed_course = percent_complete >= 100 and enrollment["progress"].get("completed_at") is None
    if just_completed_course:
        update["progress.completed_at"] = now

    await db.enrollments.update_one({"_id": enrollment["_id"]}, {"$set": update})

    if just_completed_course:
        course = await db.courses.find_one({"_id": course_id})
        user = await db.users.find_one({"_id": user_id})
        if course and user:
            if not await has_sent_trigger(user_id, course_id, "completion"):
                await trigger_academy_email(
                    user_id=user_id,
                    user_email=user["email"],
                    course_id=course_id,
                    course_title=course["title"],
                    trigger_type="completion",
                    extra_body=f"Congratulations on finishing {course['title']}!",
                )
            if course.get("recommended_next_course_id") and not await has_sent_trigger(
                user_id, course_id, "upsell"
            ):
                next_course = await db.courses.find_one({"_id": course["recommended_next_course_id"]})
                next_title = next_course["title"] if next_course else "your next course"
                await trigger_academy_email(
                    user_id=user_id,
                    user_email=user["email"],
                    course_id=course_id,
                    course_title=course["title"],
                    trigger_type="upsell",
                    extra_body=f"Ready for what's next? Check out {next_title}.",
                )

    return {
        "percent_complete": percent_complete,
        "current_lesson_id": next_lesson_id,
        "completed_course": just_completed_course,
    }

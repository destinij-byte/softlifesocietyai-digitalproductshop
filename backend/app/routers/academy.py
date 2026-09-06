from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config import settings
from app.database import get_database
from app.deps import get_current_user
from app.models.course import Course
from app.models.user import UserInDB
from app.schemas.academy import (
    CheckoutRequest,
    CheckoutResponse,
    CourseDetailOut,
    CourseListItemOut,
    EnrollmentOut,
    LessonCompleteResponse,
    LessonDetailOut,
    LessonSummaryOut,
    ModuleOut,
    ProgressOut,
    WorkbookResponse,
)
from app.services.progress_service import mark_lesson_complete
from app.services.stripe_service import construct_webhook_event, create_checkout_session
from app.services.workbook_service import sign_workbook_url
from app.services.email_service import trigger_academy_email

router = APIRouter(prefix="/academy", tags=["academy"])


def _oid(id_str: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {field_name}")
    return ObjectId(id_str)


async def _build_course_detail(db, course_doc: dict) -> CourseDetailOut:
    modules_out: list[ModuleOut] = []
    modules = await db.modules.find({"course_id": course_doc["_id"]}).sort("order", 1).to_list(length=None)
    for module in modules:
        lessons = await db.lessons.find({"_id": {"$in": module.get("lessons", [])}}).sort(
            "order", 1
        ).to_list(length=None)
        lessons_out = [
            LessonSummaryOut(id=lesson["_id"], order=lesson["order"], title=lesson["title"],
                              duration_seconds=lesson["duration_seconds"])
            for lesson in lessons
        ]
        modules_out.append(
            ModuleOut(id=module["_id"], order=module["order"], title=module["title"], lessons=lessons_out)
        )

    recommended_next = None
    next_id = course_doc.get("recommended_next_course_id")
    if next_id:
        next_doc = await db.courses.find_one({"_id": next_id, "status": "published"})
        if next_doc:
            recommended_next = CourseListItemOut(
                id=next_doc["_id"],
                slug=next_doc["slug"],
                title=next_doc["title"],
                description=next_doc["description"],
                price=next_doc["price"],
                tier=next_doc["tier"],
                thumbnail_url=next_doc.get("thumbnail_url", ""),
            )

    return CourseDetailOut(
        id=course_doc["_id"],
        slug=course_doc["slug"],
        title=course_doc["title"],
        description=course_doc["description"],
        price=course_doc["price"],
        tier=course_doc["tier"],
        thumbnail_url=course_doc.get("thumbnail_url", ""),
        workbook_url="",
        modules=modules_out,
        recommended_next=recommended_next,
    )


@router.get("/courses", response_model=list[CourseListItemOut])
async def list_courses():
    db = get_database()
    docs = await db.courses.find({"status": "published"}).to_list(length=None)
    return [
        CourseListItemOut(
            id=doc["_id"],
            slug=doc["slug"],
            title=doc["title"],
            description=doc["description"],
            price=doc["price"],
            tier=doc["tier"],
            thumbnail_url=doc.get("thumbnail_url", ""),
        )
        for doc in docs
    ]


@router.get("/courses/{slug}", response_model=CourseDetailOut)
async def get_course_detail(slug: str):
    db = get_database()
    doc = await db.courses.find_one({"slug": slug, "status": "published"})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return await _build_course_detail(db, doc)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(payload: CheckoutRequest, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    course_id = _oid(payload.course_id, "course_id")
    course_doc = await db.courses.find_one({"_id": course_id, "status": "published"})
    if course_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    existing = await db.enrollments.find_one(
        {"user_id": user.id, "course_id": course_id, "status": "active"}
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled")

    course = Course(**course_doc)
    session = create_checkout_session(course, user)
    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


@router.post("/webhook/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = construct_webhook_event(payload, sig_header)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        course_id = metadata.get("course_id")
        if user_id and course_id:
            await _create_enrollment(ObjectId(user_id), ObjectId(course_id), session.get("amount_total", 0) / 100)

    return {"received": True}


async def _create_enrollment(user_id: ObjectId, course_id: ObjectId, price_paid: float) -> None:
    db = get_database()

    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if existing is not None:
        return

    enrollment_doc = {
        "user_id": user_id,
        "course_id": course_id,
        "purchased_at": datetime.now(timezone.utc),
        "price_paid": price_paid,
        "status": "active",
        "progress": {
            "lessons_completed": [],
            "percent_complete": 0,
            "current_lesson_id": None,
            "completed_at": None,
        },
        "last_activity_at": datetime.now(timezone.utc),
    }
    await db.enrollments.insert_one(enrollment_doc)

    course = await db.courses.find_one({"_id": course_id})
    user = await db.users.find_one({"_id": user_id})
    if course and user:
        await trigger_academy_email(
            user_id=user_id,
            user_email=user["email"],
            course_id=course_id,
            course_title=course["title"],
            trigger_type="welcome",
            extra_body=f"Welcome to {course['title']}! Here's how to get the most out of it.",
        )


@router.get("/my-courses", response_model=list[EnrollmentOut])
async def my_courses(user: UserInDB = Depends(get_current_user)):
    db = get_database()
    enrollments = await db.enrollments.find({"user_id": user.id, "status": "active"}).to_list(length=None)

    results: list[EnrollmentOut] = []
    for enrollment in enrollments:
        course_doc = await db.courses.find_one({"_id": enrollment["course_id"]})
        if course_doc is None:
            continue
        results.append(
            EnrollmentOut(
                id=enrollment["_id"],
                course=CourseListItemOut(
                    id=course_doc["_id"],
                    slug=course_doc["slug"],
                    title=course_doc["title"],
                    description=course_doc["description"],
                    price=course_doc["price"],
                    tier=course_doc["tier"],
                    thumbnail_url=course_doc.get("thumbnail_url", ""),
                ),
                purchased_at=enrollment["purchased_at"],
                status=enrollment["status"],
                progress=ProgressOut(**enrollment["progress"]),
            )
        )
    return results


async def _get_active_enrollment(db, user_id: ObjectId, course_id: ObjectId) -> dict:
    enrollment = await db.enrollments.find_one(
        {"user_id": user_id, "course_id": course_id, "status": "active"}
    )
    if enrollment is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in this course")
    return enrollment


@router.get("/lessons/{lesson_id}", response_model=LessonDetailOut)
async def get_lesson_detail(lesson_id: str, user: UserInDB = Depends(get_current_user)):
    """Not in the original spec's endpoint list, but the video player needs
    the actual video_url/transcript/resources, which the public course
    detail endpoint deliberately omits - so this fetches one lesson's full
    payload, gated behind an active enrollment in its course."""
    db = get_database()
    lid = _oid(lesson_id, "lesson_id")
    lesson = await db.lessons.find_one({"_id": lid})
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    module = await db.modules.find_one({"_id": lesson["module_id"]})
    if module is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    await _get_active_enrollment(db, user.id, module["course_id"])

    return LessonDetailOut(
        id=lesson["_id"],
        order=lesson["order"],
        title=lesson["title"],
        duration_seconds=lesson["duration_seconds"],
        video_url=lesson["video_url"],
        transcript=lesson.get("transcript"),
        resources=lesson.get("resources", []),
    )


@router.get("/courses/{course_id}/progress", response_model=ProgressOut)
async def get_progress(course_id: str, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    enrollment = await _get_active_enrollment(db, user.id, _oid(course_id))
    return ProgressOut(**enrollment["progress"])


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
async def complete_lesson(lesson_id: str, user: UserInDB = Depends(get_current_user)):
    try:
        result = await mark_lesson_complete(user.id, _oid(lesson_id, "lesson_id"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    return LessonCompleteResponse(**result)


@router.get("/courses/{course_id}/workbook", response_model=WorkbookResponse)
async def get_workbook(course_id: str, request: Request, user: UserInDB = Depends(get_current_user)):
    db = get_database()
    cid = _oid(course_id)
    await _get_active_enrollment(db, user.id, cid)

    course_doc = await db.courses.find_one({"_id": cid})
    if course_doc is None or not course_doc.get("workbook_url"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workbook not available")

    signed_url = sign_workbook_url(str(cid), course_doc["workbook_url"])
    return WorkbookResponse(download_url=signed_url, expires_in_seconds=settings.workbook_url_expire_seconds)

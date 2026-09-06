"""Run on a daily schedule (cron / celery beat) to nudge inactive learners.

    python -m app.scripts.send_inactivity_nudges

Finds active enrollments with no activity in `INACTIVITY_NUDGE_DAYS` days,
that haven't already completed the course or received a nudge for it, and
sends a mid_course_nudge email.
"""

import asyncio
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.database import get_database
from app.services.email_service import has_sent_trigger, trigger_academy_email


async def run() -> None:
    db = get_database()
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.inactivity_nudge_days)

    enrollments = await db.enrollments.find(
        {
            "status": "active",
            "last_activity_at": {"$lt": cutoff},
            "progress.completed_at": None,
        }
    ).to_list(length=None)

    sent = 0
    for enrollment in enrollments:
        user_id = enrollment["user_id"]
        course_id = enrollment["course_id"]

        if await has_sent_trigger(user_id, course_id, "mid_course_nudge"):
            continue

        course = await db.courses.find_one({"_id": course_id})
        user = await db.users.find_one({"_id": user_id})
        if not course or not user:
            continue

        await trigger_academy_email(
            user_id=user_id,
            user_email=user["email"],
            course_id=course_id,
            course_title=course["title"],
            trigger_type="mid_course_nudge",
            extra_body=f"You're partway through {course['title']} - come finish strong!",
        )
        sent += 1

    print(f"Sent {sent} inactivity nudge email(s).")


if __name__ == "__main__":
    asyncio.run(run())

"""Thin wrapper around the app's existing transactional email provider.

Picks SendGrid or Postmark based on EMAIL_PROVIDER and fires a simple HTTP
call. Templates/copy live in the provider's dashboard (or the app's existing
template system) - this module only decides *when* to send and logs the
send to the `email_triggers` collection so we never double-send.
"""

from datetime import datetime, timezone

import httpx

from app.config import settings
from app.database import get_database
from app.models.email_trigger import EmailTriggerType

TEMPLATE_SUBJECTS: dict[EmailTriggerType, str] = {
    "welcome": "Welcome to {course_title} 🎓",
    "mid_course_nudge": "Pick up where you left off in {course_title}",
    "completion": "You did it! {course_title} complete ✨",
    "upsell": "What's next on your Soft Life journey",
}


async def _send_via_sendgrid(to_email: str, subject: str, body: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
            json={
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {
                    "email": settings.email_from_address,
                    "name": settings.email_from_name,
                },
                "subject": subject,
                "content": [{"type": "text/plain", "value": body}],
            },
        )


async def _send_via_postmark(to_email: str, subject: str, body: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.postmarkapp.com/email",
            headers={
                "X-Postmark-Server-Token": settings.postmark_server_token,
                "Accept": "application/json",
            },
            json={
                "From": f"{settings.email_from_name} <{settings.email_from_address}>",
                "To": to_email,
                "Subject": subject,
                "TextBody": body,
            },
        )


async def send_email(to_email: str, subject: str, body: str) -> None:
    if settings.email_provider == "postmark":
        await _send_via_postmark(to_email, subject, body)
    else:
        await _send_via_sendgrid(to_email, subject, body)


async def trigger_academy_email(
    *,
    user_id,
    user_email: str,
    course_id,
    course_title: str,
    trigger_type: EmailTriggerType,
    extra_body: str = "",
) -> None:
    """Send an Academy lifecycle email and log it to email_triggers."""
    db = get_database()

    subject = TEMPLATE_SUBJECTS[trigger_type].format(course_title=course_title)
    body = extra_body or f"Update on your course: {course_title}"

    await send_email(user_email, subject, body)

    await db.email_triggers.insert_one(
        {
            "user_id": user_id,
            "course_id": course_id,
            "trigger_type": trigger_type,
            "sent_at": datetime.now(timezone.utc),
        }
    )


async def has_sent_trigger(user_id, course_id, trigger_type: EmailTriggerType) -> bool:
    db = get_database()
    existing = await db.email_triggers.find_one(
        {"user_id": user_id, "course_id": course_id, "trigger_type": trigger_type}
    )
    return existing is not None

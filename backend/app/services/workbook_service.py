from itsdangerous import URLSafeTimedSerializer

from app.config import settings

_serializer = URLSafeTimedSerializer(settings.workbook_url_secret)


def sign_workbook_url(course_id: str, base_url: str) -> str:
    token = _serializer.dumps({"course_id": course_id})
    return f"{base_url}?token={token}"


def verify_workbook_token(token: str) -> str:
    """Returns course_id if valid, raises on expiry/tamper."""
    data = _serializer.loads(token, max_age=settings.workbook_url_expire_seconds)
    return data["course_id"]

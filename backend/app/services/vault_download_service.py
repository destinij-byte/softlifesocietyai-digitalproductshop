from itsdangerous import URLSafeTimedSerializer

from app.config import settings

_serializer = URLSafeTimedSerializer(settings.vault_download_secret)


def sign_download_url(product_id: str, base_url: str) -> str:
    token = _serializer.dumps({"product_id": product_id})
    return f"{base_url}?token={token}"


def verify_download_token(token: str) -> str:
    """Returns product_id if valid, raises on expiry/tamper."""
    data = _serializer.loads(token, max_age=settings.vault_download_expire_seconds)
    return data["product_id"]

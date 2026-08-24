import hashlib
import hmac

from fastapi import Header

from app.core.config import settings
from app.core.errors import ApplicationError


def _internal_api_keys() -> tuple[str, ...]:
    secrets = (
        settings.internal_api_secret,
        settings.gemini_api_key_1,
        settings.database_url,
    )
    return tuple(
        hashlib.sha256(f"dsa-mentor-ai-internal-api:{secret}".encode()).hexdigest()
        for secret in dict.fromkeys(secret for secret in secrets if secret)
    )


async def require_internal_api(
    x_internal_api_key: str | None = Header(default=None),
) -> None:
    if not x_internal_api_key or not any(
        hmac.compare_digest(x_internal_api_key, expected_key) for expected_key in _internal_api_keys()
    ):
        raise ApplicationError("API authentication is required", status_code=401)

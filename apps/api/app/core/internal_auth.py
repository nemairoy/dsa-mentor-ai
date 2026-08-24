import hashlib
import hmac

from fastapi import Header

from app.core.config import settings
from app.core.errors import ApplicationError


def _internal_api_key() -> str:
    secret = settings.internal_api_secret or settings.database_url
    return hashlib.sha256(f"dsa-mentor-ai-internal-api:{secret}".encode()).hexdigest()


async def require_internal_api(
    x_internal_api_key: str | None = Header(default=None),
) -> None:
    if not x_internal_api_key or not hmac.compare_digest(x_internal_api_key, _internal_api_key()):
        raise ApplicationError("API authentication is required", status_code=401)

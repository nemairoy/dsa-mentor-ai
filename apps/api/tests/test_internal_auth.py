import hashlib
import unittest

from app.core.config import settings
from app.core.errors import ApplicationError
from app.core.internal_auth import require_internal_api


class InternalApiAuthTests(unittest.IsolatedAsyncioTestCase):
    async def test_rejects_missing_key(self) -> None:
        with self.assertRaises(ApplicationError) as context:
            await require_internal_api(None)

        self.assertEqual(context.exception.status_code, 401)

    async def test_rejects_invalid_key(self) -> None:
        with self.assertRaises(ApplicationError) as context:
            await require_internal_api("invalid")

        self.assertEqual(context.exception.status_code, 401)

    async def test_accepts_derived_server_key(self) -> None:
        secret = settings.internal_api_secret or settings.database_url
        key = hashlib.sha256(f"dsa-mentor-ai-internal-api:{secret}".encode()).hexdigest()

        self.assertIsNone(await require_internal_api(key))

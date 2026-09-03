from itertools import cycle
import unittest

import httpx

from app.core.ai.gemini_client import GeminiClient


class RotatingGeminiClient(GeminiClient):
    def __init__(self, failing_status: int = 429) -> None:
        self._keys = ["limited-key", "healthy-key"]
        self._key_cycle = cycle(self._keys)
        self.attempted_keys: list[str] = []
        self.failing_status = failing_status

    async def _generate_with_key(self, prompt: str, api_key: str) -> str:
        self.attempted_keys.append(api_key)
        if api_key == "limited-key":
            request = httpx.Request("POST", "https://example.test")
            response = httpx.Response(self.failing_status, request=request)
            raise httpx.HTTPStatusError("key failed", request=request, response=response)
        return "fast response"


class GeminiClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_rotates_to_next_key_without_waiting_for_another_round(self) -> None:
        client = RotatingGeminiClient()

        result = await client.generate("prompt")

        self.assertEqual(result, "fast response")
        self.assertEqual(client.attempted_keys, ["limited-key", "healthy-key"])

    async def test_rotates_when_one_key_is_forbidden(self) -> None:
        client = RotatingGeminiClient(failing_status=403)

        result = await client.generate("prompt")

        self.assertEqual(result, "fast response")
        self.assertEqual(client.attempted_keys, ["limited-key", "healthy-key"])

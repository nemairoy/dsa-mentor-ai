import asyncio
from itertools import cycle
from typing import Any

import httpx

from app.core.config import settings
from app.core.errors import ApplicationError
from app.core.logging import logger

_http_client: httpx.AsyncClient | None = None


def _shared_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            timeout=settings.ai_timeout_seconds,
        )
    return _http_client


async def close_gemini_http_client() -> None:
    global _http_client
    if _http_client is not None:
        await _http_client.aclose()
        _http_client = None


class GeminiClient:
    def __init__(self) -> None:
        self._keys = settings.gemini_api_keys
        self._key_cycle = cycle(self._keys) if self._keys else None

    async def generate(self, prompt: str) -> str:
        if not self._key_cycle:
            raise ApplicationError("Gemini API keys are not configured", status_code=503)

        last_error: Exception | None = None
        try:
            async with asyncio.timeout(settings.ai_total_timeout_seconds):
                for retry_round in range(settings.ai_max_retries + 1):
                    for key_index in range(len(self._keys)):
                        api_key = next(self._key_cycle)
                        try:
                            return await self._generate_with_key(prompt, api_key)
                        except httpx.HTTPStatusError as error:
                            status = error.response.status_code
                            last_error = error
                            logger.warning(
                                "Gemini key failure: status=%s round=%s key=%s",
                                status,
                                retry_round + 1,
                                key_index + 1,
                            )
                        except (httpx.TimeoutException, httpx.TransportError) as error:
                            last_error = error
                            logger.warning(
                                "Gemini transport failure: round=%s key=%s",
                                retry_round + 1,
                                key_index + 1,
                            )

                    if retry_round < settings.ai_max_retries:
                        await asyncio.sleep(min(0.5 * (2**retry_round), 2))
        except TimeoutError as error:
            last_error = error
            logger.warning("Gemini request exceeded the %.1fs total budget", settings.ai_total_timeout_seconds)

        raise ApplicationError("AI service is temporarily unavailable", status_code=503) from last_error

    async def _generate_with_key(self, prompt: str, api_key: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
        payload: dict[str, Any] = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.35, "maxOutputTokens": 4096},
        }

        response = await _shared_http_client().post(url, params={"key": api_key}, json=payload)
        response.raise_for_status()
        data = response.json()

        candidates = data.get("candidates") or []
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        text = "\n".join(part.get("text", "") for part in parts).strip()

        if not text:
            raise ApplicationError("Gemini returned an empty response", status_code=502)

        return text

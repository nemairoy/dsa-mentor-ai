import asyncio
from itertools import cycle
from typing import Any

import httpx

from app.core.config import settings
from app.core.errors import ApplicationError
from app.core.logging import logger


class GeminiClient:
    def __init__(self) -> None:
        self._keys = settings.gemini_api_keys
        self._key_cycle = cycle(self._keys) if self._keys else None

    async def generate(self, prompt: str) -> str:
        if not self._key_cycle:
            raise ApplicationError("Gemini API keys are not configured", status_code=503)

        last_error: Exception | None = None
        attempts = max(1, len(self._keys) * (settings.ai_max_retries + 1))

        for attempt in range(attempts):
            api_key = next(self._key_cycle)
            try:
                return await self._generate_with_key(prompt, api_key)
            except httpx.HTTPStatusError as error:
                status = error.response.status_code
                last_error = error
                if status in {429, 500, 502, 503, 504}:
                    logger.warn("Gemini retryable failure", {"status": status, "attempt": attempt + 1})
                    await asyncio.sleep(min(2**attempt, 8))
                    continue
                raise ApplicationError("AI request was rejected by Gemini", status_code=502) from error
            except (httpx.TimeoutException, httpx.TransportError) as error:
                last_error = error
                logger.warn("Gemini transport failure", {"attempt": attempt + 1})
                await asyncio.sleep(min(2**attempt, 8))

        raise ApplicationError("AI service is temporarily unavailable", status_code=503) from last_error

    async def _generate_with_key(self, prompt: str, api_key: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
        payload: dict[str, Any] = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 2048},
        }

        async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
            response = await client.post(url, params={"key": api_key}, json=payload)
            response.raise_for_status()
            data = response.json()

        candidates = data.get("candidates") or []
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        text = "\n".join(part.get("text", "") for part in parts).strip()

        if not text:
            raise ApplicationError("Gemini returned an empty response", status_code=502)

        return text


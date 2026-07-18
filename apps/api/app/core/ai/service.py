from app.core.ai.gemini_client import GeminiClient
from app.core.ai.schemas import AiRequest, AiResponse
from app.core.chat.repository import ChatHistoryRepository
from app.core.config import settings
from app.core.prompts.prompt_library import PromptLibrary


class AiService:
    def __init__(
        self,
        prompts: PromptLibrary,
        gemini: GeminiClient,
        chat_history: ChatHistoryRepository,
    ) -> None:
        self._prompts = prompts
        self._gemini = gemini
        self._chat_history = chat_history

    async def generate(self, user_id: str, request: AiRequest) -> AiResponse:
        prompt = self._prompts.build(request)
        answer = await self._gemini.generate(prompt)
        question = request.question or request.feature.value
        await self._chat_history.save(
            user_id=user_id,
            chapter_slug=request.chapter_slug,
            lesson_slug=request.lesson_slug,
            feature=request.feature,
            question=question,
            answer=answer,
        )
        return AiResponse(answer=answer, feature=request.feature, model=settings.gemini_model)


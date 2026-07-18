from app.core.ai.gemini_client import GeminiClient
from app.core.ai.service import AiService
from app.core.chat.repository import ChatHistoryRepository
from app.core.prompts.prompt_library import PromptLibrary

ai_service = AiService(PromptLibrary(), GeminiClient(), ChatHistoryRepository())


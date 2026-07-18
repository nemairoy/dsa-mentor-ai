from app.core.ai.gemini_client import GeminiClient
from app.core.chat.repository import ChatHistoryRepository
from app.core.config import settings
from app.core.rag.retrieval import RetrievalService
from app.core.rag.schemas import RagQueryRequest, RagQueryResponse, RagSource
from app.core.rag.indexing import RagIndexingService


LOW_CONFIDENCE_MESSAGE = "I could not find enough information in the current DSA knowledge base."


class RagQuestionAnsweringService:
    def __init__(
        self,
        retrieval: RetrievalService,
        indexing: RagIndexingService,
        gemini: GeminiClient,
        chat_history: ChatHistoryRepository,
    ) -> None:
        self._retrieval = retrieval
        self._indexing = indexing
        self._gemini = gemini
        self._chat_history = chat_history

    async def answer(self, user_id: str, request: RagQueryRequest) -> RagQueryResponse:
        self._indexing.incremental_update()
        rows = self._retrieval.retrieve_for_question(
            question=request.question,
            chapter_slug=request.chapter_slug,
            lesson_slug=request.lesson_slug,
            tags=request.tags,
            difficulty=request.difficulty,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )

        confidence = max((float(row["score"]) for row in rows), default=0.0)
        sources = [self._source_from_row(row) for row in rows]

        if confidence < (request.score_threshold or settings.rag_score_threshold) or not rows:
            answer = LOW_CONFIDENCE_MESSAGE
        else:
            answer = await self._gemini.generate(self._build_prompt(request, rows))

        await self._chat_history.save(
            user_id=user_id,
            chapter_slug=request.chapter_slug or "global",
            lesson_slug=request.lesson_slug or "global",
            feature="rag_question",
            question=request.question,
            answer=answer,
        )

        return RagQueryResponse(answer=answer, sources=sources, confidence=confidence)

    def _build_prompt(self, request: RagQueryRequest, rows: list[dict]) -> str:
        context = "\n\n---\n\n".join(
            f"Source: {row['metadata'].get('chapter')} -> {row['metadata'].get('lesson')} -> {row['metadata'].get('heading')}\n{row['document']}"
            for row in rows
        )
        lesson_awareness = (
            f"Current chapter: {request.chapter_slug or 'not specified'}\n"
            f"Current lesson: {request.lesson_slug or 'not specified'}\n"
        )
        return (
            "You are DSA Mentor AI. Answer only from the retrieved context. "
            "If the context is insufficient, say exactly that there is not enough information. "
            "Do not invent algorithms, complexities, or facts.\n\n"
            f"{lesson_awareness}\n"
            f"Student question: {request.question}\n\n"
            f"Retrieved context:\n{context}\n\n"
            "Return a clear answer and include a Sources section listing chapter -> lesson -> heading."
        )

    def _source_from_row(self, row: dict) -> RagSource:
        metadata = row["metadata"]
        return RagSource(
            chapter=str(metadata["chapter"]),
            lesson=str(metadata["lesson"]),
            heading=str(metadata.get("heading") or ""),
            subheading=str(metadata.get("subheading") or ""),
            href=str(metadata["href"]),
            file_path=str(metadata["file_path"]),
            score=float(row["score"]),
        )

from app.core.config import settings
from app.core.rag.document_loader import ContentDocumentLoader
from app.core.rag.embeddings import EmbeddingService
from app.core.rag.schemas import SearchRequest, SearchResult
from app.core.rag.vector_store import ChromaVectorRepository


class RetrievalService:
    def __init__(
        self,
        embeddings: EmbeddingService,
        vector_store: ChromaVectorRepository,
        loader: ContentDocumentLoader,
    ) -> None:
        self._embeddings = embeddings
        self._vector_store = vector_store
        self._loader = loader

    def search(self, request: SearchRequest) -> list[SearchResult]:
        semantic_results = []
        if request.semantic and request.query.strip():
            semantic_results = self._semantic_search(request)

        keyword_results = self._keyword_search(request)
        merged: dict[str, SearchResult] = {}

        for result in [*semantic_results, *keyword_results]:
            key = f"{result.lesson_id}:{result.heading}"
            existing = merged.get(key)
            if existing is None or result.score > existing.score:
                merged[key] = result

        return sorted(merged.values(), key=lambda item: item.score, reverse=True)[: request.top_k]

    def retrieve_for_question(
        self,
        question: str,
        chapter_slug: str | None,
        lesson_slug: str | None,
        tags: list[str],
        difficulty: str | None,
        top_k: int | None,
        score_threshold: float | None,
    ) -> list[dict]:
        embedding = self._embeddings.embed_query(question)
        where = self._build_where(chapter_slug, lesson_slug, difficulty)
        rows = self._vector_store.query(embedding, top_k or settings.rag_top_k, where=where)
        threshold = score_threshold if score_threshold is not None else settings.rag_score_threshold

        return [
            row
            for row in rows
            if row["score"] >= threshold and self._matches_tags(str(row["metadata"].get("tags", "")), tags)
        ]

    def _semantic_search(self, request: SearchRequest) -> list[SearchResult]:
        rows = self.retrieve_for_question(
            question=request.query,
            chapter_slug=request.chapter_slug,
            lesson_slug=None,
            tags=request.tags,
            difficulty=request.difficulty,
            top_k=request.top_k,
            score_threshold=0,
        )
        return [self._row_to_result(row) for row in rows]

    def _keyword_search(self, request: SearchRequest) -> list[SearchResult]:
        query_terms = {term.lower() for term in request.query.split() if term.strip()}
        results: list[SearchResult] = []

        for document in self._loader.load():
            if request.chapter_slug and document.chapter_slug != request.chapter_slug:
                continue
            if request.difficulty and document.difficulty != request.difficulty:
                continue
            if request.tags and not set(request.tags).issubset(set(document.tags)):
                continue

            text = f"{document.chapter_title} {document.lesson_title} {' '.join(document.tags)} {document.markdown}".lower()
            score = 0.35 if not query_terms else len([term for term in query_terms if term in text]) / max(len(query_terms), 1)
            if score <= 0:
                continue
            results.append(
                SearchResult(
                    lesson_id=document.lesson_id,
                    chapter=document.chapter_title,
                    lesson=document.lesson_title,
                    heading=document.lesson_title,
                    href=document.href,
                    score=min(1.0, score),
                    snippet=document.markdown[:260].replace("\n", " "),
                    tags=document.tags,
                    difficulty=document.difficulty,
                )
            )

        return sorted(results, key=lambda item: item.score, reverse=True)[: request.top_k]

    def _row_to_result(self, row: dict) -> SearchResult:
        metadata = row["metadata"]
        return SearchResult(
            lesson_id=str(metadata["lesson_id"]),
            chapter=str(metadata["chapter"]),
            lesson=str(metadata["lesson"]),
            heading=str(metadata.get("heading") or ""),
            href=str(metadata["href"]),
            score=float(row["score"]),
            snippet=str(row["document"])[:260].replace("\n", " "),
            tags=[tag for tag in str(metadata.get("tags", "")).split(",") if tag],
            difficulty=str(metadata["difficulty"]),
        )

    def _build_where(self, chapter_slug: str | None, lesson_slug: str | None, difficulty: str | None) -> dict | None:
        filters = []
        if chapter_slug:
            filters.append({"chapter_slug": chapter_slug})
        if lesson_slug:
            filters.append({"lesson_slug": lesson_slug})
        if difficulty:
            filters.append({"difficulty": difficulty})
        if not filters:
            return None
        if len(filters) == 1:
            return filters[0]
        return {"$and": filters}

    def _matches_tags(self, tag_text: str, tags: list[str]) -> bool:
        if not tags:
            return True
        available = {tag for tag in tag_text.split(",") if tag}
        return set(tags).issubset(available)


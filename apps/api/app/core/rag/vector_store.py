from pathlib import Path
from typing import Any

from app.core.config import settings
from app.core.errors import ApplicationError
from app.core.rag.chunking import ContentChunk


class ChromaVectorRepository:
    def __init__(self) -> None:
        Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
        self._client = None
        self._collection = None

    @property
    def collection(self):
        if self._collection is None:
            try:
                import chromadb
            except ImportError as error:
                raise ApplicationError(
                    "ChromaDB is not installed. Run pip install -r apps/api/requirements.txt.",
                    status_code=503,
                ) from error

            self._client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
            self._collection = self._client.get_or_create_collection(
                name=settings.chroma_collection,
                metadata={"hnsw:space": "cosine"},
            )

        return self._collection

    def count(self) -> int:
        return self.collection.count()

    def upsert(self, chunks: list[ContentChunk], embeddings: list[list[float]]) -> None:
        if not chunks:
            return

        self.collection.upsert(
            ids=[chunk.id for chunk in chunks],
            documents=[chunk.text for chunk in chunks],
            embeddings=embeddings,
            metadatas=[chunk.metadata for chunk in chunks],
        )

    def delete_lesson(self, lesson_id: str) -> None:
        self.collection.delete(where={"lesson_id": lesson_id})

    def rebuild(self) -> None:
        _ = self.collection
        try:
            self._client.delete_collection(settings.chroma_collection)
        except Exception:
            pass
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

    def query(self, embedding: list[float], top_k: int, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        result = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        rows: list[dict[str, Any]] = []
        ids = result.get("ids", [[]])[0]
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        for index, chunk_id in enumerate(ids):
            distance = float(distances[index])
            rows.append(
                {
                    "id": chunk_id,
                    "document": documents[index],
                    "metadata": metadatas[index],
                    "score": max(0.0, 1.0 - distance),
                }
            )

        return rows

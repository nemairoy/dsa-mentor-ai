import hashlib
import json
from pathlib import Path

from app.core.config import settings
from app.core.rag.chunking import SemanticMarkdownChunker
from app.core.rag.document_loader import ContentDocumentLoader, LessonDocument
from app.core.rag.embeddings import EmbeddingService
from app.core.rag.vector_store import ChromaVectorRepository


class RagIndexingService:
    def __init__(
        self,
        loader: ContentDocumentLoader,
        chunker: SemanticMarkdownChunker,
        embeddings: EmbeddingService,
        vector_store: ChromaVectorRepository,
    ) -> None:
        self._loader = loader
        self._chunker = chunker
        self._embeddings = embeddings
        self._vector_store = vector_store
        self._manifest_path = Path(settings.chroma_persist_dir) / "index_manifest.json"

    def rebuild(self) -> dict[str, int]:
        documents = self._loader.load()
        self._vector_store.rebuild()
        manifest: dict[str, str] = {}
        chunks_indexed = 0

        for document in documents:
            chunks_indexed += self._index_document(document)
            manifest[document.lesson_id] = self._fingerprint(document)

        self._write_manifest(manifest)
        return {"lessons": len(documents), "chunks": chunks_indexed}

    def incremental_update(self) -> dict[str, int]:
        documents = self._loader.load()
        manifest = self._read_manifest()
        next_manifest: dict[str, str] = {}
        lessons_updated = 0
        chunks_indexed = 0

        for document in documents:
            fingerprint = self._fingerprint(document)
            next_manifest[document.lesson_id] = fingerprint
            if manifest.get(document.lesson_id) == fingerprint:
                continue
            self._vector_store.delete_lesson(document.lesson_id)
            chunks_indexed += self._index_document(document)
            lessons_updated += 1

        removed_lessons = set(manifest) - set(next_manifest)
        for lesson_id in removed_lessons:
            self._vector_store.delete_lesson(lesson_id)

        self._write_manifest(next_manifest)
        return {"lessons": lessons_updated, "chunks": chunks_indexed, "removed": len(removed_lessons)}

    def status(self) -> dict[str, int | str]:
        manifest = self._read_manifest()
        return {
            "collection": settings.chroma_collection,
            "chunks": self._vector_store.count(),
            "indexed_lessons": len(manifest),
        }

    def _index_document(self, document: LessonDocument) -> int:
        chunks = self._chunker.chunk(document)
        embeddings = self._embeddings.embed_documents([chunk.text for chunk in chunks])
        self._vector_store.upsert(chunks, embeddings)
        return len(chunks)

    def _fingerprint(self, document: LessonDocument) -> str:
        payload = json.dumps(document.metadata, sort_keys=True) + document.markdown
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _read_manifest(self) -> dict[str, str]:
        if not self._manifest_path.exists():
            return {}
        return json.loads(self._manifest_path.read_text(encoding="utf-8"))

    def _write_manifest(self, manifest: dict[str, str]) -> None:
        self._manifest_path.parent.mkdir(parents=True, exist_ok=True)
        self._manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


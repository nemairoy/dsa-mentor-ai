import re
from dataclasses import dataclass

from app.core.config import settings
from app.core.rag.document_loader import LessonDocument


@dataclass(frozen=True)
class ContentChunk:
    id: str
    text: str
    metadata: dict[str, str | int | float | bool]


class SemanticMarkdownChunker:
    def __init__(self, chunk_size: int | None = None, overlap: int | None = None) -> None:
        self._chunk_size = chunk_size or settings.rag_chunk_size
        self._overlap = overlap or settings.rag_chunk_overlap
        self._headers = [("#", "heading"), ("##", "subheading"), ("###", "section")]

    def chunk(self, document: LessonDocument) -> list[ContentChunk]:
        from langchain_text_splitters import MarkdownHeaderTextSplitter

        splitter = MarkdownHeaderTextSplitter(headers_to_split_on=self._headers, strip_headers=False)
        header_chunks = splitter.split_text(document.markdown)
        chunks: list[ContentChunk] = []

        for header_index, header_chunk in enumerate(header_chunks):
            semantic_parts = self._split_semantic_blocks(header_chunk.page_content)
            for part_index, text in enumerate(self._merge_parts(semantic_parts)):
                heading = str(header_chunk.metadata.get("heading") or document.lesson_title)
                subheading = str(header_chunk.metadata.get("subheading") or "")
                chunk_index = len(chunks)
                chunks.append(
                    ContentChunk(
                        id=f"{document.lesson_id}:{chunk_index}",
                        text=text,
                        metadata={
                            "lesson_id": document.lesson_id,
                            "chapter_slug": document.chapter_slug,
                            "chapter": document.chapter_title,
                            "lesson_slug": document.lesson_slug,
                            "lesson": document.lesson_title,
                            "difficulty": document.difficulty,
                            "tags": ",".join(document.tags),
                            "learning_objectives": " | ".join(document.learning_objectives),
                            "animation_id": document.animation_id,
                            "ai_context": document.ai_context,
                            "time_complexity": document.time_complexity,
                            "space_complexity": document.space_complexity,
                            "related_lessons": ",".join(document.related_lessons),
                            "estimated_reading_time": document.estimated_reading_time,
                            "file_path": document.file_path,
                            "href": document.href,
                            "heading": heading,
                            "subheading": subheading,
                            "header_index": header_index,
                            "part_index": part_index,
                            "chunk_index": chunk_index,
                        },
                    )
                )

        return chunks

    def _split_semantic_blocks(self, text: str) -> list[str]:
        pattern = re.compile(r"(```[\s\S]*?```|\n\|.+\|\n(?:\|.*\|\n)+|^> .+(?:\n> .+)*)", re.MULTILINE)
        parts: list[str] = []
        cursor = 0

        for match in pattern.finditer(text):
            before = text[cursor : match.start()].strip()
            if before:
                parts.extend(paragraph.strip() for paragraph in re.split(r"\n\s*\n", before) if paragraph.strip())
            parts.append(match.group(0).strip())
            cursor = match.end()

        remainder = text[cursor:].strip()
        if remainder:
            parts.extend(paragraph.strip() for paragraph in re.split(r"\n\s*\n", remainder) if paragraph.strip())

        return parts or [text.strip()]

    def _merge_parts(self, parts: list[str]) -> list[str]:
        merged: list[str] = []
        current = ""

        for part in parts:
            candidate = f"{current}\n\n{part}".strip() if current else part
            if len(candidate) <= self._chunk_size:
                current = candidate
                continue

            if current:
                merged.append(current)
            current = part

        if current:
            merged.append(current)

        if self._overlap <= 0 or len(merged) <= 1:
            return merged

        overlapped: list[str] = []
        previous_tail = ""
        for chunk in merged:
            text = f"{previous_tail}\n\n{chunk}".strip() if previous_tail else chunk
            overlapped.append(text)
            previous_tail = chunk[-self._overlap :]
        return overlapped

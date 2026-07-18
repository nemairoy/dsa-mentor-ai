import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.core.config import settings


@dataclass(frozen=True)
class LessonDocument:
    lesson_id: str
    chapter_slug: str
    chapter_title: str
    lesson_slug: str
    lesson_title: str
    difficulty: str
    tags: list[str]
    learning_objectives: list[str]
    animation_id: str
    ai_context: str
    time_complexity: str
    space_complexity: str
    related_lessons: list[str]
    estimated_reading_time: int
    file_path: str
    href: str
    markdown: str
    metadata: dict[str, Any]


class ContentDocumentLoader:
    def __init__(self, content_root: str | None = None) -> None:
        self._content_root = Path(content_root or settings.content_root).resolve()

    def load(self) -> list[LessonDocument]:
        roadmap = json.loads((self._content_root / "roadmap.json").read_text(encoding="utf-8"))
        documents: list[LessonDocument] = []

        for chapter_ref in roadmap["chapters"]:
            chapter_dir = self._content_root / chapter_ref["slug"]
            metadata = json.loads((chapter_dir / "metadata.json").read_text(encoding="utf-8"))

            for lesson_ref in chapter_ref["lessons"]:
                lesson = metadata["lessons"][lesson_ref["slug"]]
                markdown_path = chapter_dir / f"{lesson_ref['slug']}.md"
                markdown = markdown_path.read_text(encoding="utf-8")

                documents.append(
                    LessonDocument(
                        lesson_id=lesson["lessonId"],
                        chapter_slug=chapter_ref["slug"],
                        chapter_title=metadata["title"],
                        lesson_slug=lesson_ref["slug"],
                        lesson_title=lesson["title"],
                        difficulty=lesson["difficulty"],
                        tags=lesson.get("tags", []),
                        learning_objectives=lesson.get("learningObjectives", []),
                        animation_id=lesson["animationId"],
                        ai_context=lesson["aiContext"],
                        time_complexity=lesson.get("timeComplexity", ""),
                        space_complexity=lesson.get("spaceComplexity", ""),
                        related_lessons=lesson.get("relatedLessons", []),
                        estimated_reading_time=lesson.get("estimatedTimeMinutes", lesson["durationMinutes"]),
                        file_path=str(markdown_path),
                        href=f"/learn/{chapter_ref['slug']}/{lesson_ref['slug']}",
                        markdown=markdown,
                        metadata=lesson,
                    )
                )

        return documents


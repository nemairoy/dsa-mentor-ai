from enum import StrEnum

from pydantic import BaseModel, Field


class AiFeature(StrEnum):
    explain_lesson = "explain_lesson"
    explain_code = "explain_code"
    line_by_line_code = "line_by_line_code"
    convert_code = "convert_code"
    summary = "summary"
    revision_notes = "revision_notes"
    flashcards = "flashcards"
    interview_questions = "interview_questions"
    mcq_quiz = "mcq_quiz"
    coding_questions = "coding_questions"
    follow_up = "follow_up"


class SupportedLanguage(StrEnum):
    python = "python"
    java = "java"
    javascript = "javascript"
    c = "c"


class AiRequest(BaseModel):
    feature: AiFeature
    chapter_slug: str = Field(alias="chapterSlug")
    lesson_slug: str = Field(alias="lessonSlug")
    lesson_title: str = Field(alias="lessonTitle")
    lesson_markdown: str = Field(alias="lessonMarkdown")
    question: str | None = None
    code: str | None = None
    source_language: SupportedLanguage | None = Field(default=None, alias="sourceLanguage")
    target_language: SupportedLanguage | None = Field(default=None, alias="targetLanguage")


class AiResponse(BaseModel):
    answer: str
    feature: AiFeature
    model: str


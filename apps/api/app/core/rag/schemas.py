from pydantic import BaseModel, Field


class RagSource(BaseModel):
    chapter: str
    lesson: str
    heading: str | None = None
    subheading: str | None = None
    href: str
    file_path: str
    score: float


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    chapter_slug: str | None = Field(default=None, alias="chapterSlug")
    lesson_slug: str | None = Field(default=None, alias="lessonSlug")
    tags: list[str] = Field(default_factory=list)
    difficulty: str | None = None
    top_k: int | None = Field(default=None, alias="topK", ge=1, le=20)
    score_threshold: float | None = Field(default=None, alias="scoreThreshold", ge=0, le=1)


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[RagSource]
    confidence: float


class SearchRequest(BaseModel):
    query: str = Field(default="", max_length=1000)
    chapter_slug: str | None = Field(default=None, alias="chapterSlug")
    tags: list[str] = Field(default_factory=list)
    difficulty: str | None = None
    top_k: int = Field(default=10, alias="topK", ge=1, le=50)
    semantic: bool = True


class SearchResult(BaseModel):
    lesson_id: str
    chapter: str
    lesson: str
    heading: str | None = None
    href: str
    score: float
    snippet: str
    tags: list[str]
    difficulty: str


class SearchResponse(BaseModel):
    results: list[SearchResult]


class IndexStatus(BaseModel):
    collection: str
    chunks: int
    indexed_lessons: int

class RelatedContentResponse(BaseModel):
    related: list[SearchResult]


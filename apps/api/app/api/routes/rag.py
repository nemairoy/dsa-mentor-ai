from fastapi import APIRouter, Header

from app.core.errors import ApplicationError
from app.core.rag.container import rag_indexing_service, rag_qa_service, retrieval_service
from app.core.rag.schemas import (
    IndexStatus,
    RagQueryRequest,
    RagQueryResponse,
    RelatedContentResponse,
    SearchRequest,
    SearchResponse,
)

router = APIRouter()


@router.post("/index/rebuild")
async def rebuild_index() -> dict[str, int]:
    return rag_indexing_service.rebuild()


@router.post("/index/incremental")
async def incremental_index() -> dict[str, int]:
    return rag_indexing_service.incremental_update()


@router.get("/index/status", response_model=IndexStatus)
async def index_status() -> dict[str, int | str]:
    return rag_indexing_service.status()


@router.post("/query", response_model=RagQueryResponse)
async def answer_question(
    request: RagQueryRequest,
    x_student_id: str | None = Header(default=None),
) -> RagQueryResponse:
    if not x_student_id:
        raise ApplicationError("Student identity is required", status_code=401)

    return await rag_qa_service.answer(x_student_id, request)


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    rag_indexing_service.incremental_update()
    return SearchResponse(results=retrieval_service.search(request))


@router.post("/related", response_model=RelatedContentResponse)
async def related_content(request: SearchRequest) -> RelatedContentResponse:
    rag_indexing_service.incremental_update()
    return RelatedContentResponse(related=retrieval_service.search(request))

from fastapi import APIRouter, Depends, Header

from app.core.ai.container import ai_service
from app.core.ai.schemas import AiRequest, AiResponse
from app.core.errors import ApplicationError
from app.core.internal_auth import require_internal_api

router = APIRouter(dependencies=[Depends(require_internal_api)])


@router.post("/generate", response_model=AiResponse)
async def generate_ai_response(
    request: AiRequest,
    x_student_id: str | None = Header(default=None),
) -> AiResponse:
    if not x_student_id:
        raise ApplicationError("Student identity is required", status_code=401)

    return await ai_service.generate(x_student_id, request)

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.infrastructure.database.postgres import database_status

router = APIRouter()


@router.get("")
async def health_check() -> JSONResponse:
    database = await database_status()
    healthy = database == "connected"
    return JSONResponse(
        status_code=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "ok" if healthy else "degraded",
            "service": settings.app_name,
            "database": database,
        },
    )


@router.get("/live")
async def liveness_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}

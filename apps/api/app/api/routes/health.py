from fastapi import APIRouter

from app.core.config import settings
from app.infrastructure.database.postgres import database_status

router = APIRouter()


@router.get("")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "database": await database_status(),
    }


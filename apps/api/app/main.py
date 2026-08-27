import asyncio
from contextlib import asynccontextmanager, suppress
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.ai import router as ai_router
from app.api.routes.rag import router as rag_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, logger
from app.infrastructure.database.postgres import close_database, connect_database
from app.core.ai.gemini_client import close_gemini_http_client
from app.core.rag.container import rag_indexing_service


async def bootstrap_rag_index() -> None:
    try:
        status = await asyncio.to_thread(rag_indexing_service.status)
        if int(status["chunks"]) == 0:
            result = await asyncio.to_thread(rag_indexing_service.rebuild)
            logger.info("Bootstrapped RAG index: %s", result)
    except Exception:
        logger.exception("RAG index bootstrap failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Starting %s in %s", settings.app_name, settings.app_env)
    await connect_database()
    rag_bootstrap_task = asyncio.create_task(bootstrap_rag_index())
    yield
    if not rag_bootstrap_task.done():
        rag_bootstrap_task.cancel()
    with suppress(asyncio.CancelledError):
        await rag_bootstrap_task
    await close_gemini_http_client()
    await close_database()
    logger.info("Stopped %s", settings.app_name)


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_observability_and_security(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    start = time.perf_counter()
    response = await call_next(request)
    latency_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "request completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms,
        },
    )
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


register_exception_handlers(app)
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(rag_router, prefix="/api/v1/rag", tags=["rag"])

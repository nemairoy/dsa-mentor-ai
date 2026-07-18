import ssl

import asyncpg

from app.core.config import settings
from app.core.logging import logger

_pool: asyncpg.Pool | None = None


async def connect_database() -> None:
    global _pool
    if _pool is not None:
        return

    ssl_context = None
    if settings.database_ssl:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

    _pool = await asyncpg.create_pool(dsn=settings.database_url, ssl=ssl_context, min_size=1, max_size=5)
    logger.info("Connected to PostgreSQL")


async def close_database() -> None:
    global _pool
    if _pool is None:
        return

    await _pool.close()
    _pool = None


async def database_status() -> str:
    if _pool is None:
        return "not_connected"

    async with _pool.acquire() as connection:
        await connection.execute("SELECT 1")
    return "connected"


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    return _pool

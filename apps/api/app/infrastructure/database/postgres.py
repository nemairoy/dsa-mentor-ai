import ssl
from urllib.parse import quote, unquote, urlsplit, urlunsplit

import asyncpg

from app.core.config import settings
from app.core.logging import logger

_pool: asyncpg.Pool | None = None

_SUPABASE_POOLERS = {
    "vjwyvogyvhysqjjnuwww": "aws-1-ap-southeast-1.pooler.supabase.com",
}


def resolved_database_url() -> str:
    parsed = urlsplit(settings.database_url)
    hostname = parsed.hostname or ""
    if not hostname.startswith("db.") or not hostname.endswith(".supabase.co"):
        return settings.database_url

    project_ref = hostname.removeprefix("db.").removesuffix(".supabase.co")
    pooler_host = settings.database_pooler_host or _SUPABASE_POOLERS.get(project_ref)
    if not pooler_host:
        return settings.database_url

    username = quote(f"postgres.{project_ref}", safe="")
    password = quote(unquote(parsed.password or ""), safe="")
    credentials = username if not password else f"{username}:{password}"
    netloc = f"{credentials}@{pooler_host}:{settings.database_pooler_port}"
    return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))


async def connect_database() -> None:
    global _pool
    if _pool is not None:
        return

    ssl_context = None
    database_url = resolved_database_url()
    if settings.database_ssl:
        ssl_context = ssl.create_default_context()
        uses_supabase_pooler = (urlsplit(database_url).hostname or "").endswith(".pooler.supabase.com")
        if not settings.database_ssl_verify or uses_supabase_pooler:
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

    _pool = await asyncpg.create_pool(
        dsn=database_url,
        ssl=ssl_context,
        min_size=0,
        max_size=5,
        timeout=10,
        command_timeout=30,
    )
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

    try:
        async with _pool.acquire(timeout=5) as connection:
            await connection.execute("SELECT 1")
        return "connected"
    except Exception:
        logger.exception("Database health check failed")
        return "unavailable"


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    return _pool

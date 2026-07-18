import asyncpg

from app.infrastructure.database.postgres import get_pool


class ChatHistoryRepository:
    async def save(
        self,
        user_id: str,
        chapter_slug: str,
        lesson_slug: str,
        feature: object,
        question: str,
        answer: str,
    ) -> None:
        pool = get_pool()
        async with pool.acquire() as connection:
            await connection.execute(
                """
                INSERT INTO ai_chat_history (user_id, chapter_slug, lesson_slug, feature, question, answer)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                user_id,
                chapter_slug,
                lesson_slug,
                getattr(feature, "value", str(feature)),
                question,
                answer,
            )

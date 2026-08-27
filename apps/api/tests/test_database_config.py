import unittest
from unittest.mock import patch

from app.core.config import settings
from app.infrastructure.database.postgres import resolved_database_url


class DatabaseConfigTests(unittest.TestCase):
    def test_preserves_regular_database_url(self) -> None:
        database_url = "postgresql://user:password@example.com:5432/app"
        with (
            patch.object(settings, "database_url", database_url),
            patch.object(settings, "database_pooler_host", None),
        ):
            self.assertEqual(resolved_database_url(), database_url)

    def test_converts_supabase_direct_url_to_ipv4_pooler(self) -> None:
        with (
            patch.object(
                settings,
                "database_url",
                "postgresql://postgres:p%40ss@db.projectref.supabase.co:5432/postgres",
            ),
            patch.object(settings, "database_pooler_host", "aws-1-region.pooler.supabase.com"),
            patch.object(settings, "database_pooler_port", 5432),
        ):
            self.assertEqual(
                resolved_database_url(),
                "postgresql://postgres.projectref:p%40ss@aws-1-region.pooler.supabase.com:5432/postgres",
            )

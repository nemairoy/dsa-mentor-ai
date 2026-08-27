import json
import unittest
from unittest.mock import AsyncMock, patch

from app.api.routes.health import health_check, liveness_check
from app.core.rag.container import rag_indexing_service
from app.main import bootstrap_rag_index


class ProductionHealthTests(unittest.IsolatedAsyncioTestCase):
    async def test_readiness_is_healthy_when_database_is_connected(self) -> None:
        with patch("app.api.routes.health.database_status", AsyncMock(return_value="connected")):
            response = await health_check()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.body)["status"], "ok")

    async def test_readiness_is_degraded_when_database_is_unavailable(self) -> None:
        with patch("app.api.routes.health.database_status", AsyncMock(return_value="unavailable")):
            response = await health_check()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(json.loads(response.body)["status"], "degraded")

    async def test_liveness_does_not_depend_on_database(self) -> None:
        self.assertEqual((await liveness_check())["status"], "ok")

    async def test_empty_rag_index_is_bootstrapped(self) -> None:
        with (
            patch.object(rag_indexing_service, "status", return_value={"chunks": 0}),
            patch.object(rag_indexing_service, "rebuild", return_value={"lessons": 385, "chunks": 900}) as rebuild,
        ):
            await bootstrap_rag_index()

        rebuild.assert_called_once_with()

    async def test_populated_rag_index_is_not_rebuilt(self) -> None:
        with (
            patch.object(rag_indexing_service, "status", return_value={"chunks": 900}),
            patch.object(rag_indexing_service, "rebuild") as rebuild,
        ):
            await bootstrap_rag_index()

        rebuild.assert_not_called()

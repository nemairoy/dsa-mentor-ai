import math
import unittest

from app.core.rag.embeddings import HashingEmbeddingService


class HashingEmbeddingTests(unittest.TestCase):
    def test_embeddings_are_deterministic_and_normalized(self) -> None:
        service = HashingEmbeddingService(dimensions=64)
        first = service.embed_query("binary search sorted array")
        second = service.embed_query("binary search sorted array")

        self.assertEqual(first, second)
        self.assertAlmostEqual(math.sqrt(sum(value * value for value in first)), 1.0)

    def test_related_text_is_closer_than_unrelated_text(self) -> None:
        service = HashingEmbeddingService(dimensions=256)
        query = service.embed_query("binary search array")
        related = service.embed_query("binary search on a sorted array")
        unrelated = service.embed_query("graph minimum spanning tree")

        related_score = sum(left * right for left, right in zip(query, related))
        unrelated_score = sum(left * right for left, right in zip(query, unrelated))
        self.assertGreater(related_score, unrelated_score)

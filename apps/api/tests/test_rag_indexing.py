import unittest
from types import SimpleNamespace
from unittest.mock import Mock, call, patch

from app.core.rag.chunking import ContentChunk
from app.core.rag.indexing import RagIndexingService


class RagIndexingTests(unittest.TestCase):
    def test_rebuild_embeds_chunks_in_bounded_batches(self) -> None:
        document = SimpleNamespace(lesson_id="lesson-1", metadata={}, markdown="# Lesson")
        chunks = [ContentChunk(id=str(index), text=f"chunk {index}", metadata={}) for index in range(300)]
        loader = Mock(load=Mock(return_value=[document]))
        chunker = Mock(chunk=Mock(return_value=chunks))
        embeddings = Mock()
        embeddings.embed_documents.side_effect = lambda texts: [[0.1] for _ in texts]
        vector_store = Mock()
        service = RagIndexingService(loader, chunker, embeddings, vector_store)

        with patch.object(service, "_write_manifest") as write_manifest:
            result = service.rebuild()

        self.assertEqual(result, {"lessons": 1, "chunks": 300})
        self.assertEqual([len(args.args[0]) for args in embeddings.embed_documents.call_args_list], [256, 44])
        self.assertEqual(vector_store.upsert.call_count, 2)
        self.assertEqual(write_manifest.call_args, call({"lesson-1": service._fingerprint(document)}))

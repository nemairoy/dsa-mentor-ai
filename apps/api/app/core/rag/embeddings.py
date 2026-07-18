from abc import ABC, abstractmethod
from functools import cached_property

from app.core.config import settings
from app.core.errors import ApplicationError


class EmbeddingService(ABC):
    @abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError

    @abstractmethod
    def embed_query(self, text: str) -> list[float]:
        raise NotImplementedError


class SentenceTransformerEmbeddingService(EmbeddingService):
    @cached_property
    def _model(self):
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as error:
            raise ApplicationError(
                "Sentence Transformers is not installed. Run pip install -r apps/api/requirements.txt.",
                status_code=503,
            ) from error

        return SentenceTransformer(settings.embedding_model_name)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._model.encode(texts, normalize_embeddings=True).tolist()

    def embed_query(self, text: str) -> list[float]:
        return self.embed_documents([text])[0]

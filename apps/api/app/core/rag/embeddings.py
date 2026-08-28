from abc import ABC, abstractmethod
from functools import cached_property
import hashlib
import math
import re

from app.core.config import settings
from app.core.errors import ApplicationError


class EmbeddingService(ABC):
    @abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError

    @abstractmethod
    def embed_query(self, text: str) -> list[float]:
        raise NotImplementedError


class HashingEmbeddingService(EmbeddingService):
    def __init__(self, dimensions: int | None = None) -> None:
        self._dimensions = dimensions or settings.hashing_embedding_dimensions

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        features = [*tokens, *(f"{left}_{right}" for left, right in zip(tokens, tokens[1:]))]
        vector = [0.0] * self._dimensions

        for feature in features:
            digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
            value = int.from_bytes(digest, "big")
            index = value % self._dimensions
            vector[index] += 1.0 if value & 1 else -1.0

        norm = math.sqrt(sum(component * component for component in vector))
        return [component / norm for component in vector] if norm else vector


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

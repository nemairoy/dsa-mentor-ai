from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="apps/api/.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "DSA Mentor AI API"
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    backend_cors_origins: str = Field(default="http://localhost:3000")
    database_url: str
    database_ssl: bool = True
    gemini_api_key_1: str | None = None
    gemini_api_key_2: str | None = None
    gemini_api_key_3: str | None = None
    gemini_api_key_4: str | None = None
    gemini_model: str = "gemini-2.5-flash-lite"
    ai_timeout_seconds: float = 30.0
    ai_max_retries: int = 2
    content_root: str = "content"
    chroma_persist_dir: str = "data/chroma"
    chroma_collection: str = "dsa_knowledge_base"
    rag_chunk_size: int = 1400
    rag_chunk_overlap: int = 180
    rag_top_k: int = 6
    rag_score_threshold: float = 0.25
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @property
    def gemini_api_keys(self) -> list[str]:
        return [
            key
            for key in [
                self.gemini_api_key_1,
                self.gemini_api_key_2,
                self.gemini_api_key_3,
                self.gemini_api_key_4,
            ]
            if key
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

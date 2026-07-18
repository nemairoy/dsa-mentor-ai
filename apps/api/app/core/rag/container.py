from app.core.ai.gemini_client import GeminiClient
from app.core.chat.repository import ChatHistoryRepository
from app.core.rag.chunking import SemanticMarkdownChunker
from app.core.rag.document_loader import ContentDocumentLoader
from app.core.rag.embeddings import SentenceTransformerEmbeddingService
from app.core.rag.indexing import RagIndexingService
from app.core.rag.qa import RagQuestionAnsweringService
from app.core.rag.retrieval import RetrievalService
from app.core.rag.vector_store import ChromaVectorRepository

document_loader = ContentDocumentLoader()
chunker = SemanticMarkdownChunker()
embedding_service = SentenceTransformerEmbeddingService()
vector_store = ChromaVectorRepository()
rag_indexing_service = RagIndexingService(document_loader, chunker, embedding_service, vector_store)
retrieval_service = RetrievalService(embedding_service, vector_store, document_loader)
rag_qa_service = RagQuestionAnsweringService(
    retrieval_service,
    rag_indexing_service,
    GeminiClient(),
    ChatHistoryRepository(),
)

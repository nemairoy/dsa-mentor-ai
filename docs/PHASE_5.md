# Phase 5: RAG Intelligence Layer

## Scope

Phase 5 adds a production-oriented retrieval-augmented generation layer using LangChain text splitters, Sentence Transformers embeddings, persistent ChromaDB, FastAPI APIs, and the existing Gemini client as the final LLM.

This phase does not add animations, recommendations, admin, CMS, or a separate vector database service.

## Architecture

```text
Frontend
  -> Next.js API proxy
  -> FastAPI RAG API
  -> ContentDocumentLoader
  -> SemanticMarkdownChunker
  -> EmbeddingService
  -> ChromaVectorRepository
  -> RetrievalService
  -> RagQuestionAnsweringService
  -> GeminiClient
```

## ChromaDB

Persistent path:

```text
data/chroma
```

Collection:

```text
dsa_knowledge_base
```

The vector index is generated locally and ignored by git.

## Chunking

Markdown is split through LangChain `MarkdownHeaderTextSplitter`, then merged along semantic boundaries:

- headings
- subheadings
- paragraphs
- code blocks
- tables
- callouts and warnings

Config:

```text
RAG_CHUNK_SIZE=1400
RAG_CHUNK_OVERLAP=180
```

## Embeddings

Default embedding provider:

```text
sentence-transformers/all-MiniLM-L6-v2
```

The embedding service is abstracted behind `EmbeddingService`, so Gemini embeddings or another provider can replace it without changing retrieval, indexing, or API code.

## Retrieval

Supported retrieval modes:

- semantic search
- keyword search
- hybrid merge
- chapter filtering
- tag filtering
- difficulty filtering
- top-k retrieval
- score threshold

## Citations

RAG answers return source objects with:

- chapter
- lesson
- heading
- subheading
- href
- file path
- score

Gemini prompts require a Sources section using chapter, lesson, and heading.

## Hallucination Protection

If retrieval confidence is below threshold, the system returns:

```text
I could not find enough information in the current DSA knowledge base.
```

Gemini is instructed to answer only from retrieved context.

## APIs

FastAPI:

- `POST /api/v1/rag/index/rebuild`
- `POST /api/v1/rag/index/incremental`
- `GET /api/v1/rag/index/status`
- `POST /api/v1/rag/search`
- `POST /api/v1/rag/related`
- `POST /api/v1/rag/query`

Next.js:

- `POST /api/rag/search`
- `POST /api/rag/query`

## Commands

```powershell
npm run env:bootstrap
.\.venv\Scripts\python -m pip install -r apps/api/requirements.txt
npm run lint:web
npm run build:web
```

Build the vector index:

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/api/v1/rag/index/rebuild
```


# Performance Review

## Frontend

- Dynamic lesson pages are generated from content metadata.
- Heavy visualization routes are isolated from lesson pages.
- Service worker provides offline shell fallback.
- SVG animations use memoized rendering and JSON state updates.

## Backend

- FastAPI has request latency logging and request IDs.
- PostgreSQL uses pooled connections.
- RAG uses persistent ChromaDB and incremental indexing.

## Database

Indexes exist for progress, bookmarks, notes, practice, visualization usage, achievements, audit logs, and content lookup.

## RAG

- ChromaDB persists vectors locally.
- Incremental indexing avoids full rebuilds when content changes.
- Retrieval supports top-k and score thresholds.

## Remaining Performance Work

- Add Redis caching for admin analytics and repeated search queries.
- Add production APM traces for AI and RAG latency.
- Add bundle-analysis CI for frontend JavaScript budgets.


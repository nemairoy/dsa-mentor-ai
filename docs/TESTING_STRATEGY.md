# Testing Strategy

## Unit Tests

- Content schema validation
- Animation JSON parser
- Prompt guard
- Rate limiter
- Analytics score calculations
- RBAC permission checks

## Integration Tests

- Better Auth protected routes
- Profile setup flow
- Lesson loading from roadmap
- Notes, bookmarks, progress APIs
- Practice attempts
- Admin RBAC APIs
- RAG index status/search/query

## API Tests

- FastAPI health
- AI generate endpoint with missing identity
- RAG low-confidence fallback
- Admin APIs unauthenticated and unauthorized responses

## E2E Tests

- Google auth smoke test in staging
- Profile setup
- Lesson reading
- Bookmark and note save
- Practice problem solved
- Visualization open
- Admin dashboard access by role

## Current Validation Commands

```powershell
npm run validate:content
npm run validate:production
npm run lint:web
npm run build:web
$env:PYTHONPATH='apps/api'; .\.venv\Scripts\python -m compileall apps/api/app
```


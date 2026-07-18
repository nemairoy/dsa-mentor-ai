# Deployment Guide

## Production Environment

Use `.env.production.example` as the template.

Required external services:

- PostgreSQL / Supabase
- Google OAuth
- Gemini API keys
- Judge0-compatible code execution service
- Persistent disk for ChromaDB

## Startup Checks

1. Generate production env files from the secret manager.
2. Run database migrations.
3. Rebuild content search index if content changed.
4. Rebuild or incrementally update ChromaDB.
5. Run health checks:

```powershell
npm run validate:content
npm run validate:production
npm run build:web
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/api/v1/rag/index/status
```

## Deployment Checklist

- OAuth redirect URLs match production domain.
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` use HTTPS.
- `BACKEND_CORS_ORIGINS` is restricted to production frontend.
- `CODE_EXECUTION_PROVIDER=judge0` and `JUDGE0_BASE_URL` points to the production Judge0 endpoint.
- Judge0 language IDs are configured for Python, Java, and C++.
- ChromaDB persistent directory is mounted.
- Admin roles are assigned intentionally.
- Logs and database backups are enabled.

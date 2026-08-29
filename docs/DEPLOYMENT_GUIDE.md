# Deployment Guide

## Production services

| Service | Platform | Purpose |
| --- | --- | --- |
| Web | Vercel | Next.js UI, authentication, application APIs, Judge0 proxy |
| API | Render | FastAPI health, AI generation, and RAG |
| Database | Supabase | Better Auth and application PostgreSQL data |
| Executor | Judge0-compatible endpoint | Isolated Python, Java, and C++ execution |

Use `.env.production.example`, `apps/web/.env.example`, and `apps/api/.env.example` as the authoritative variable inventories. Store real values in platform secret managers, never in Git.

## Required setup

1. Create the Supabase/PostgreSQL database and use its transaction/session pooler where appropriate.
2. Apply Better Auth migrations from `apps/web` with `npx auth@latest migrate`.
3. Apply every SQL file in `db/migrations` in numeric order.
4. Configure Google OAuth authorized origins and callback URLs for the production domain.
5. Configure matching `INTERNAL_API_SECRET` values in Vercel and Render. If omitted, both services must share the same server-only `DATABASE_URL` used by the fallback credential derivation.
6. Configure one or more Gemini keys while keeping `GEMINI_MODEL=gemini-2.5-flash-lite`.
7. Configure Judge0 provider, language IDs, CPU, wall-time, memory, and request limits.

## Build and release checks

```powershell
npm ci
npm run validate:content
npm run validate:production
npm run lint:web
npm run build:web
$env:PYTHONPATH = "apps/api"
python -m unittest discover -s apps/api/tests -v
npm audit --audit-level=high
```

Pull requests must pass the `web`, `api`, and Vercel preview checks before merge.

## Post-deployment verification

```powershell
Invoke-RestMethod https://dsa-mentor-ai-api-l97r.onrender.com/health/live
Invoke-RestMethod https://dsa-mentor-ai-api-l97r.onrender.com/health
Invoke-WebRequest https://dsamentor-ai.vercel.app
```

Expected readiness response includes `status: ok` and `database: connected`. RAG bootstraps asynchronously; its internally authenticated status should settle at 385 indexed lessons and 3,083 chunks for the current content version.

Also verify:

- Google social sign-in returns a Google authorization URL and redirects to `/dashboard` after callback.
- `/learn/searching/introduction` and `/marathon` load for an authenticated user.
- one AI response, one RAG query, and one Judge0 sample execution succeed.
- the landing page remains theme-independent after sign-out.

## Rollback

1. Roll back Vercel to the last successful deployment for web-only regressions.
2. Roll back Render to the last healthy API commit for AI/RAG regressions.
3. Do not reverse database migrations destructively during an incident. Deploy a forward-compatible corrective migration.
4. Re-run readiness, OAuth, AI, RAG, and execution smoke tests.

## Operational recommendations

- Use a self-hosted or paid Judge0 service for predictable production capacity.
- Configure external uptime/error monitoring for both health endpoints and the web origin.
- Enable Supabase backups and test restoration regularly.
- Rotate Google, Gemini, database, and internal credentials if exposure is suspected.

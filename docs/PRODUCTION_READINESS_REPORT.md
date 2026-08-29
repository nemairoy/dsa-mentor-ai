# Production Readiness

Last reviewed: August 2026.

## Verified controls

- Vercel web and Render API deployments from `main`.
- GitHub Actions web/API checks and Vercel previews on pull requests.
- Google OAuth through Better Auth with protected server routes.
- PostgreSQL readiness checks and pooled Supabase connection normalization.
- Distributed PostgreSQL rate limiting; no per-instance in-memory limiter.
- Internally authenticated web-to-API communication.
- Low-memory deterministic RAG embeddings and batched background indexing.
- Current RAG target: 385 lessons and 3,083 chunks.
- Judge0-backed Python, Java, and C++ execution with resource limits.
- Mobile-responsive protected layout, idle logout, error boundaries, and theme-safe sign-out.
- Content, production, lint, TypeScript/build, Python test, and dependency-audit checks.

## Operational limitations

- Render cold starts can delay the first API request; readiness should be retried before declaring an outage.
- The public Judge0 CE endpoint is not an availability guarantee. Use managed or self-hosted capacity for a commercial workload.
- OAuth end-to-end automation still requires a dedicated staging Google account and Playwright setup.
- External APM/uptime alerting is recommended even though structured health endpoints exist.
- Profile images should move to managed object storage with upload scanning for higher-volume production use.
- AI output is structurally validated where required, but generated educational/code content still needs runtime tests and normal user judgment.

## Release evidence

The repository README contains live service links and the exact local/CI validation commands. Deployment-specific secrets remain in Vercel, Render, Supabase, Google, and Gemini secret stores and must never be committed.

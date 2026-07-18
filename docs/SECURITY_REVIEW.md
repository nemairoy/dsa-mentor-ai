# Security Review

## Authentication and Authorization

- Better Auth remains the authentication boundary.
- Protected routes use session checks.
- Admin routes and APIs use RBAC through `AdminService`.
- Role escalation is audited through `admin_audit_log`.

## Secrets

- Secrets are generated from `GoogleAuth.txt` into ignored env files.
- `.env.production.example` documents production variables without secret values.
- `GEMINI_MODEL` is pinned to `gemini-2.5-flash-lite`.

## API Protection

- Sensitive AI/RAG/admin authoring routes use session validation.
- AI and RAG proxy routes have in-memory rate limits.
- Prompt-injection guardrails reject common instruction override attempts before calling AI services.
- Admin APIs require explicit permissions.
- Practice code execution is routed through Judge0-compatible sandbox execution by default; production should not execute untrusted code inside the main web/API process.

## Database

- PostgreSQL calls use parameterized queries.
- User-owned data is filtered by Better Auth user ID.
- Required indexes exist for user, lesson, progress, practice, audit, and RAG-related access patterns.

## Browser Security

- Security headers are configured in Next.js and FastAPI:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - Content Security Policy

## Remaining Security Work

- Replace in-memory rate limiting with Redis or a managed rate-limit service before horizontal scaling.
- Add malware scanning when real binary uploads are implemented.
- Add external SIEM integration for audit events.
- Track current moderate npm advisory chain through Next/PostCSS/better-auth; `npm audit --audit-level=high` passes and npm only offers a breaking force fix at this time.

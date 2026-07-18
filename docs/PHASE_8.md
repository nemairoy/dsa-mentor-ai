# Phase 8: Internal Content Management Studio

## Scope

Phase 8 adds an internal admin CMS for administrators and content creators. It does not add deployment, Docker, Kubernetes, billing, payments, community features, or multiplayer.

## RBAC

Roles:

- Student
- Content Creator
- Reviewer
- Administrator
- Super Administrator

Admin pages and APIs use the shared admin guard and role permissions.

## Database Tables

- `admin_roles`
- `admin_user_roles`
- `content_drafts`
- `content_versions`
- `cms_media_assets`
- `ai_authoring_requests`
- `admin_audit_log`
- `rag_retrieval_logs`
- `search_logs`

## Admin Pages

- `/admin`
- `/admin/content`
- `/admin/users`
- `/admin/rag`

## APIs

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `POST /api/admin/users/roles`
- `GET /api/admin/content/drafts`
- `POST /api/admin/content/drafts`
- `POST /api/admin/ai/author`
- `GET /api/admin/rag/status`
- `POST /api/admin/rag/incremental`
- `POST /api/admin/rag/rebuild`

## CMS Architecture

```text
Admin route/API
  -> Better Auth session
  -> AdminService RBAC guard
  -> PostgresAdminRepository
  -> Audit log
```

## Markdown Editor

The editor supports:

- live preview
- toolbar
- code blocks
- tables
- callouts through Markdown
- image syntax
- draft autosave
- version history storage

## AI Authoring

The CMS uses the existing FastAPI AI service and Gemini client. UI never calls Gemini directly.

Pinned model:

```text
GEMINI_MODEL=gemini-2.5-flash-lite
```

AI authoring supports draft generation, examples, code, practice problems, interviews, revision notes, flashcards, quizzes, learning objectives, and metadata suggestions.

## RAG and Search Management

The admin studio can view RAG status and trigger:

- rebuild knowledge base
- incremental index
- ChromaDB status check


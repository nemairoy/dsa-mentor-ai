# Phase 3: Lesson Experience and AI Foundation

## Scope

Phase 3 upgrades the dynamic lesson experience and adds the FastAPI-owned Gemini AI foundation.

## Lesson Experience

- Breadcrumbs
- Estimated reading time
- Difficulty
- Prerequisites
- Learning objectives
- Markdown explanation
- Professional code blocks
- Time and space complexity
- Complexity table
- Common mistakes
- Interview tips
- Related lessons
- Practice placeholders
- Bookmarking
- Reading progress
- Notes
- AI assistant panel
- Previous and next lesson navigation
- Share and print actions

## AI Architecture

The browser never calls Gemini directly.

```text
Frontend UI
  -> Next.js /api/ai session proxy
  -> FastAPI /api/v1/ai/generate
  -> AiService
  -> PromptLibrary
  -> GeminiClient
  -> Gemini generateContent API
```

Next.js validates Better Auth session ownership. FastAPI owns prompt construction, key rotation, retry/failover, timeouts, rate-limit handling, and chat history writes.

## Prompt Library

Prompt templates live in `apps/api/app/core/prompts/prompt_library.py`.

Each feature has its own template:

- explain lesson
- explain code
- line-by-line code
- convert code
- summary
- revision notes
- flashcards
- interview questions
- MCQ quiz
- coding questions
- follow-up question

## Gemini Key Rotation

Gemini keys are loaded from env values generated from `GoogleAuth.txt`.

The `GeminiClient` cycles through configured keys. Retryable failures such as `429`, `500`, `502`, `503`, `504`, timeouts, and transport errors move to the next key and retry with bounded backoff.

## Tables

- `lesson_bookmarks`
- `lesson_progress`
- `lesson_notes`
- `ai_chat_history`

## APIs

Next.js:

- `GET /api/learning/bookmarks`
- `POST /api/learning/bookmarks`
- `POST /api/learning/progress`
- `GET /api/learning/notes`
- `POST /api/learning/notes`
- `POST /api/ai`

FastAPI:

- `POST /api/v1/ai/generate`


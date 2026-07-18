# AI Pipeline

```text
UI
  -> Next.js session-protected API
  -> FastAPI AI/RAG route
  -> Prompt Library or RAG context assembler
  -> Gemini Client
  -> Gemini model gemini-2.5-flash-lite
```

The UI never calls Gemini directly.

Prompt-injection guardrails run on sensitive proxy routes before AI calls.


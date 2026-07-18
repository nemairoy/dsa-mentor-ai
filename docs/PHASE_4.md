# Phase 4: Complete DSA Knowledge Base

## Scope

Phase 4 expands the dynamic Markdown content system into a complete DSA syllabus. It does not add RAG, embeddings, ChromaDB, LangChain, animations, recommendations, or admin tooling.

## Totals

- Chapters: 37
- Lessons: 385

## Content Files

The canonical roadmap is `content/roadmap.json`.

Each roadmap chapter points to a folder under `content/<chapter-slug>/` containing:

- `metadata.json`
- Markdown lesson files
- `images/` placeholder directory for future assets

Generated global maps:

- `content/search-index.json`
- `content/animation-map.json`
- `content/ai-map.json`

## Metadata Design

Every lesson metadata entry includes:

- lesson ID
- chapter
- title and summary
- difficulty
- estimated time
- prerequisites
- tags
- learning objectives
- animation ID and future component name
- AI context, AI summary, and AI prompt context
- future RAG metadata
- future embedding metadata
- time complexity
- space complexity
- related lessons
- future quiz ID
- future flashcard ID
- future project ID
- image placeholders
- practice prompts
- code examples

The frontend content schema uses strict required fields for the current UI and passthrough metadata for future expansion.

## Search Index

`scripts/generate-search-index.mjs` reads `roadmap.json`, chapter metadata, and Markdown files to generate `content/search-index.json`.

The index supports:

- lesson search
- topic search
- tag search
- difficulty search

It includes precomputed facets for topics, tags, and difficulties.

## Animation Mapping

The current product uses visualization and AI-assisted learning surfaces. Historical Phase 4 metadata still keeps explicit animation IDs so each lesson can resolve to a visual learning route or planned animation component.

Each lesson defines:

- `animationId`
- `animationComponent`

The global `content/animation-map.json` maps every lesson ID to its planned animation component.

## AI Metadata

AI features remain compatible with the Phase 3 AI service.

Each lesson defines:

- `aiContext`
- `aiSummary`
- `aiPromptContext`
- `ragMetadata`
- `embeddingMetadata`

RAG and embedding generation are handled by later production workflows; the Phase 4 content remains compatible with those pipelines.

## Commands

```powershell
npm run content:generate
npm run content:index
npm run lint:web
npm run build:web
```

# Phase 7: Learning Intelligence Layer

## Scope

Phase 7 adds personal learning intelligence on top of existing progress, notes, bookmarks, AI conversations, visualizations, and DSA content.

It does not add admin, CMS, Docker, deployment, online judging, or collaboration.

## Architecture

```text
Better Auth session
  -> Next.js API / protected pages
  -> IntelligenceService
  -> PostgresIntelligenceRepository
  -> PostgreSQL analytics/practice tables
```

## Database Tables

- `practice_problems`
- `practice_attempts`
- `visualization_usage`
- `revision_items`
- `achievement_definitions`
- `user_achievements`
- `learning_reports`

## Analytics Engine

The engine calculates:

- learning score
- confidence score
- consistency score
- revision score
- problem solving score
- topic mastery
- weak topics
- strong topics
- interview readiness

## Practice Engine

Practice problems are seeded from the dynamic 299-lesson roadmap. Each lesson receives Easy, Medium, and Hard placeholder problems with metadata for:

- tags
- companies
- hints
- explanations
- future editorials
- future solutions
- future test cases
- future online judge metadata

## Recommendation Engine

Recommendations are derived from topic mastery and learning behaviour. The engine can recommend:

- next lesson
- practice
- revision
- visualization
- AI explanation

## Achievement System

Initial achievements:

- First Step
- Consistent Learner
- Problem Solver
- AI Explorer
- Visualization Master
- Perfect Week

XP and level are calculated from earned achievements.

## APIs

- `GET /api/intelligence/analytics`
- `GET /api/intelligence/recommendations`
- `GET /api/intelligence/learning-plan`
- `GET /api/intelligence/achievements`
- `GET /api/intelligence/reports/weekly`
- `GET /api/practice/problems`
- `POST /api/practice/attempts`
- `POST /api/visualizations/usage`

## Pages

- `/intelligence`
- `/practice`

## Commands

```powershell
npm run practice:seed
npm run lint:web
npm run build:web
```


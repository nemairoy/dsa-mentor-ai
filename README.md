# DSA Mentor AI

Production-oriented DSA learning workspace with Google authentication, structured lessons, practice problems, AI help, profile/progress tracking, visual learning surfaces, and a Judge0-backed code executor.

## Features

- Next.js web app with Better Auth Google OAuth
- FastAPI backend for health, AI, and RAG APIs
- PostgreSQL/Supabase persistence for profiles, progress, notes, bookmarks, practice attempts, and analytics
- 37 DSA chapters and 385 lessons
- Practice problem pages with sample tests, explanations, autosaved code, AI validation, and Python/Java/C++ execution through Judge0
- Profile photo upload, dashboard analytics, light/dark theme, and responsive protected layout
- Production checks for content, build, security files, and deployment readiness

## Quick Start

```powershell
npm run env:bootstrap
npm install
npm --workspace apps/web install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r apps/api/requirements.txt
```

Run the web app:

```powershell
npm run dev:web
```

Run the API:

```powershell
npm run dev:api
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://127.0.0.1:8000`

Production-style start commands:

```powershell
npm run build:web
npm run start:web
npm run start:api
```

## Validation

Run these before deployment:

```powershell
npm run validate:content
npm run validate:production
npm run lint:web
npm run build:web
```

## Code Execution

The practice executor is production-ready through Judge0 by default. Local compilers are not required in deployment.

Required web env:

```env
CODE_EXECUTION_PROVIDER=judge0
JUDGE0_BASE_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_RAPIDAPI_HOST=
JUDGE0_PYTHON_LANGUAGE_ID=71
JUDGE0_JAVA_LANGUAGE_ID=62
JUDGE0_CPP_LANGUAGE_ID=54
```

For serious production use, prefer a self-hosted Judge0 instance or a paid managed Judge0 endpoint instead of relying on the public CE endpoint.

## Database

Better Auth owns its auth tables. Apply auth tables with:

```powershell
cd apps/web
npx auth@latest migrate
```

Project migrations live in `db/migrations`.

## Environment

`scripts/bootstrap-env.ps1` reads `GoogleAuth.txt` and creates ignored env files:

- `apps/web/.env.local`
- `apps/api/.env`

Do not commit generated env files, OAuth client secret files, or `GoogleAuth.txt`.

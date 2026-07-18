# Architecture

DSA Mentor AI follows Clean Architecture boundaries.

## Frontend

The Next.js app is split into:

- `app`: routing, layouts, server pages, and route handlers
- `components`: reusable UI and layout primitives
- `core`: domain and application logic
- `infrastructure`: config, database, and logging adapters
- `lib`: framework integration helpers such as Better Auth client/server wiring

Authentication is implemented in Next.js through Better Auth because Google OAuth callback handling and browser sessions belong at the web edge. Profile setup uses a route handler that validates the Better Auth session, validates input, and writes the profile through a repository interface.

## Backend

The FastAPI app is intentionally small in Phase 1:

- health route
- centralized settings
- logging
- exception handling
- async PostgreSQL connection lifecycle

DSA and AI APIs will be added in later phases behind application services instead of directly inside route handlers.

## Database

PostgreSQL stores auth data, sessions, and application profile data. Better Auth migrations create the auth tables. Application migrations live under `db/migrations`.


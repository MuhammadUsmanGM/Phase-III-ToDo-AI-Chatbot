# Gemini CLI: Backend Context

You are a senior backend engineer specializing in FastAPI.

## Tech Stack
- **Framework:** FastAPI
- **Database:** Neon Serverless PostgreSQL
- **Schema & ORM:** SQLModel
- **Authentication:** "Better Auth" JWT generation and verification.

## Core Directives
1.  **API Implementation:** Your primary role is to build a robust API that implements the contract in `specs/api/rest-endpoints.md`.
2.  **API Conventions:** All task-related endpoints **MUST** be structured under `/api/{user_id}/tasks/...`.
3.  **Database:** All database operations must use SQLModel and conform to the schema in `specs/database/schema.md`. Load database connection strings from environment variables, never hardcode them.
4.  **Authorization:** This is a multi-user system and data isolation is critical.
    - For any endpoint that includes `{user_id}` in the path, you **MUST** first verify the JWT attached to the request.
    - The JWT will be signed with a secret stored in the `BETTER_AUTH_SECRET` environment variable.
    - After decoding the token, you **MUST** ensure the user ID from the token payload matches the `{user_id}` from the URL. If they do not match, you must return a `403 Forbidden` error immediately.
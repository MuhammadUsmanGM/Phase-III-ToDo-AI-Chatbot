# Gemini CLI: Frontend Context

You are a senior frontend engineer specializing in Next.js.

## Tech Stack
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Client-side handling of "Better Auth" JWTs.

## Core Directives
1.  **API Consumption:** Your primary role is to build a responsive UI that consumes the backend API. The authoritative contract is `specs/api/rest-endpoints.md`.
2.  **Authentication:** For every request to the backend API, you **MUST** attach the user's JWT from "Better Auth" in the `Authorization` header as a Bearer token.
    ```
    Authorization: Bearer <jwt_token>
    ```
3.  **UI/UX:** The structure and state of the application pages are defined in `specs/ui/pages.md`.
4.  **Component-Based:** Build reusable components and maintain a clean, organized `app/` directory structure.
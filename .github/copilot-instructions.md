# Copilot / AI Agent Instructions — OPERACAO-01

This file contains compact, actionable guidance for AI coding agents working on this repository.

## Big picture
- Monolith Next.js App Router app (`app/`) with server-side business logic located in `lib/` and DB layer in `prisma/`.
- Postgres + Prisma is the single source of truth; Prisma client is exported as a singleton at [lib/db/index.ts](lib/db/index.ts#L1-L20).
- Authentication uses NextAuth Credentials provider configured at [lib/auth/authOptions.ts](lib/auth/authOptions.ts#L1-L120). Session strategy: JWT; custom `jwt` and `session` callbacks add `id` and `role`.
- Business logic (metrics, aggregations) lives in `lib/metrics/*` (e.g. [lib/metrics/studentMetrics.ts](lib/metrics/studentMetrics.ts#L1-L120)). API routes and server components call these helpers.

## Developer workflows (commands)
- Install: `npm install` (root). See `package.json` scripts; dev server runs on port 3001: `npm run dev`.
- Database setup: `npx prisma generate` then `npx prisma migrate dev --name init`.
- Seeding: `npm run seed` (runs `tsx prisma/seed.ts`) — see `prisma/seed.ts` and `package.json` `prisma.seed` entry.
- Quick validation scripts: run `npx tsx tests/validate-studylog.ts`, `npx tsx tests/validate-metrics.ts`, `npx tsx tests/validate-admin.ts` to exercise logic without the UI.

## Project-specific conventions and patterns
- Prisma client singleton: always import from `lib/db` to avoid creating multiple `PrismaClient` instances (see [lib/db/index.ts](lib/db/index.ts#L1-L20)). Logging of SQL queries is enabled (`log: ["query"]`).
- Validation uses `zod` and exported schemas live in `lib/validators/` (example: `studyLog` schema at [lib/validators/studyLog.ts](lib/validators/studyLog.ts#L1-L40)). When modifying forms or API, reuse these schemas.
- Date handling: metrics use `date-fns` and normalize dates to ISO YYYY-MM-DD keys in `lib/metrics` (see `getDailyProgress` in [lib/metrics/studentMetrics.ts](lib/metrics/studentMetrics.ts#L1-L120)). Prefer server-side date normalization.
- Auth routes: NextAuth API is wired under App Router `/api/auth/[...nextauth]` (App Router maps to `app/api/*`). Use `authOptions` for provider logic and callback changes.

## Integration points / external dependencies
- Postgres database (env: `DATABASE_URL`). Example `.env` at repo root shows local dev URL and NextAuth envs. See `.env`.
- NextAuth expects `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (configured in `.env`).
- Third-party libs: `zod` for validation, `react-hook-form` in UI, `date-fns` for date maths, `prisma` + `@prisma/client` for DB.

## How to change behavior safely
- When changing DB schema: update `prisma/schema.prisma`, run `npx prisma generate`, create a migration `npx prisma migrate dev`, and update `prisma/seed.ts` if seeds change.
- When editing authentication flows, update `lib/auth/authOptions.ts` and ensure session/jwt callbacks preserve `id` and `role` keys used throughout UI.
- When changing validation rules, update the Zod schema in `lib/validators/*` and run `npx tsx tests/validate-studylog.ts` (and related validators) to catch regressions.

## Useful file examples to inspect
- App entry & routes: `app/` (use App Router conventions).
- DB singleton: [lib/db/index.ts](lib/db/index.ts#L1-L20)
- Auth config: [lib/auth/authOptions.ts](lib/auth/authOptions.ts#L1-L120)
- Example validator: [lib/validators/studyLog.ts](lib/validators/studyLog.ts#L1-L40)
- Metrics & aggregations: [lib/metrics/studentMetrics.ts](lib/metrics/studentMetrics.ts#L1-L120)
- Prisma schema & seeds: `prisma/schema.prisma`, `prisma/seed.ts`

## Behavior to preserve
- Keep Prisma client as a singleton import (`lib/db`).
- Preserve `jwt`/`session` callback behavior that injects `id` and `role` into tokens and sessions.
- Preserve Zod schemas as canonical validation for both API and UI.

If any section is unclear or you'd like specific examples expanded (API route examples, common refactors, or test commands), tell me which part and I'll iterate.

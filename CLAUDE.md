# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project: OPERAÇÃO 01

### Stack

Next.js 16 (App Router, Turbopack), TypeScript, Prisma ORM, PostgreSQL, NextAuth.js (credentials + JWT), Tailwind CSS, shadcn/ui, TanStack Query, Sonner/Pino.

### Commands

```bash
npm run dev          # Start dev server on http://localhost:3001
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run migrate      # prisma migrate deploy (production migrations)

# Database
npx prisma migrate status
npx prisma migrate deploy
npx prisma studio

# Seed / changelog scripts
npx tsx scripts/seed-changelog-vX.ts  # run with DATABASE_URL pointing to prod

# Validation (pre-deploy)
python .agent/scripts/checklist.py .
python .agent/scripts/verify_all.py . --url http://localhost:3001
```

> There is no automated test suite wired to `npm test`. Playwright is installed but E2E tests are run manually via `.agent/scripts/`.

### Environment

- `.env` — base vars (committed)
- `.env.local` — overrides for local dev (not committed)
- `.env.production` — production secrets (gitignored)
- Local DB: PostgreSQL `operacao01` on `localhost:5432`, user `postgres`, password `postgres`
- If adding a schema column without a migration, apply it manually via `ALTER TABLE` on the local DB.

### Architecture

**Route layout (App Router):**
- `app/` — all Next.js routes
- `app/admin/*` — admin/mentor panel (dashboard, students, questions, schedules, subjects, concursos, landing CMS, settings, access-log)
- `app/admin/access-log/` — session tracking panel (admin master only)
- `app/admin/v2/*` — V2 admin panel: `dashboard/` (analytics funil), `students/` (alunos V2), `catalogo/` (SubjectV2/ContentV2/TopicV2)
- `app/student/*` — student area (dashboard, study log, weekly plan, question bank, profile)
- `app/student/fase1/` — V2: pizza de tópicos por disciplina; lateral de ciclos anteriores (conquistas); `/ciclo/[cycleId]` modo leitura
- `app/student/fase1/[blockId]/` — V2: pizza de conteúdos dentro de uma disciplina
- `app/student/fase1/[blockId]/[contentId]/` — V2: checklist de tópicos de um conteúdo
- `app/student/fase2/` — V2: cadernos de erro (5 checkboxes por disciplina via f2Bool1..5)
- `app/student/fase3/` — V2: simulados (anotar resultado "X/Y" e notas por simulado)
- `app/api/admin/*` — admin REST endpoints (role-guarded via `getServerSession`)
- `app/api/student/*` — student REST endpoints
- `app/api/study-log/*`, `app/api/user/*` — shared endpoints (`/api/user/heartbeat` updates session tracking)
- `app/signin/` — credential login page

**`lib/` — business logic (never import from components):**
- `lib/db/index.ts` — singleton Prisma client
- `lib/auth/authOptions.ts` — NextAuth config (JWT, 1 h expiry, `role` on token); `events.signIn` creates `UserSession`, `events.signOut` closes it
- `lib/auth/superAdmin.ts` — super-admin gate (bypasses mentor scope restrictions)
- `lib/auth/questionPermissions.ts` — question CRUD permission rules
- `lib/settings.ts` — typed key/value store backed by `SystemSettings` table; use `getSetting` / `setSetting` / `setManySettings`
- `lib/v2/cycles.ts` — `getActiveGrid(userId)` + `getStudiedTopicV2Ids(userId)`: helpers usados pelos endpoints de ciclo para buscar o grid ativo e anotar tópicos já estudados
- `lib/metrics/adminMetrics.ts` — V1 performance ranking (30% volume, 50% accuracy, 20% consistency); MENTORs see only their linked students
- `lib/metrics/cachedAdminMetrics.ts` — cache wrapper for V1 metrics; use `revalidateTag` for on-demand revalidation
- `lib/metrics/studentMetrics.ts` — per-student weekly/biweekly metrics (V1)
- `lib/metrics/v2Metrics.ts` — V2 funnel metrics: Fase1% (topics done), Fase2% (cadernos), Fase3% (simulados answered); returns `V2StudentRow[]` + simulation trends
- `lib/dashboard/visualTokens.ts` — 10-color categorical palette; `defaultColorForId()` for deterministic fallback
- `lib/dashboard/chartTheme.ts` — design tokens for charts (axis, labels, series ramps) using CSS vars
- `lib/motivation/messages.ts` — motivational scenarios (streak, comeback, accuracy, volume, etc.) derived from student metrics
- `lib/ai/questionAnalyzer.ts` — `enrichQuestion()` abstraction; routes to Anthropic/OpenAI/Gemini based on `ai_provider` system setting
- `lib/questions/bulkParser.ts` — CSV (`;` delimiter) / JSON bulk import parser; normalises PT/EN column names, auto-links Subject/Content by name
- `lib/services/riskAlertService.ts` — predictive alerts (inactivity, low accuracy, sharp drop)
- `lib/date-utils.ts` — date helpers always anchored to Araguaína timezone (`getAraguainaStartOfWeek`)

**Data model highlights:**
- `User` — roles: `ADMIN`, `STUDENT`, `MENTOR`; `appVersion: "v1" | "v2"` controls which UI the student sees
- `MentorshipLink` — `@@unique([studentId])`: each student has exactly one mentor
- `StudyLog` — V1 core activity record (date, hours, questions answered/correct, subject, optional content)
- `StudyLogHistory` — audit trail of log edits
- `WeeklyPlan` / `WeeklyPlanItem` — V1 per-user weekly schedule; items link back to `StudyLog` via `studyLogId @unique`
- `Question` — statuses: `PENDING` → `APPROVED` | `REJECTED`; `alternatives` is JSON; `correctAnswer` required to approve
- `QuestionAnswer` — `@@unique([userId, questionId])` tracks which questions a student has answered
- `UserSession` — session tracking record: `loginAt`, `logoutAt?`, `lastSeenAt` (updated by heartbeat every 10 min), `durationMin?`, `ipAddress?`, `userAgent?`; records older than 90 days are purged probabilistically on heartbeat; only created when `tracking_enabled = "true"`
- `SystemSettings` — key/value config table; all valid keys defined in `lib/settings.ts → SETTING_DEFAULTS`
- **V2 models (parallel study system):**
  - `SubjectV2` / `ContentV2` / `TopicV2` — curriculum hierarchy (disciplina → conteúdo → tópico)
  - `StudyGrid` — one grid **per cycle** per student (`userId` no longer unique); fields: `cycleNumber`, `cycleLabel` (required), `active: bool`, `completedAt?`; only one `active=true` per student enforced by partial unique index; use `findFirst({ where: { userId, active: true } })` — never `findUnique({ where: { userId } })`
  - `StudyBlock` — one block per SubjectV2 within a grid; links to StudyContentBlocks
  - `StudyContentBlock` — one block per ContentV2; links to StudyTopicBlocks
  - `StudyTopicBlock` — leaf node; `completed: bool`, `f2Bool1..5` (caderno de erros checkboxes)
  - `Simulation` — simulado event scoped to a `StudyGrid` (i.e., to a specific cycle)
  - `SimulationBlock` — per-student simulado result: `studentResult` (string "X/Y"), `studentNotes`
  - `SubjectColorPreference` — `@@unique([userId, subjectV2Id])` stores pie chart color per student per subject

**Auth & authorization pattern:**
Server pages call `getServerSession(authOptions)` and check `session.user.role`. API routes do the same before touching the DB. The JWT carries `id` and `role` (no DB round-trip per request). Session expires absolutely at 1 hour.

**System settings keys** (`lib/settings.ts → SETTING_DEFAULTS`):
- `school_name`, `whatsapp_number`, `instagram_url`, `linkedin_url`, `support_email` — branding/contacts
- `session_max_age` — JWT expiry in seconds (default 86400)
- `maintenance_mode` — redirects non-admins to maintenance page when `"true"`
- `mentor_dashboard_widgets` — JSON object controlling which V1 dashboard widgets are visible
- `ai_provider` / `ai_model` / `ai_api_key` — AI provider config (anthropic/openai/google)
- `student_upload_enabled` — when `"false"`, hides the question upload FAB from students
- `student_questions_enabled` — when `"false"`, hides "Banco de Questões" from student menu and blocks the route (redirects to dashboard)
- `tracking_enabled` — when `"false"`, disables session tracking (no `UserSession` records created, heartbeats ignored); toggle in `/admin/settings` → admin master only

**Question flow:**
1. Student submits via form (gated by `student_upload_enabled` and `student_questions_enabled`) **or** admin/mentor bulk-imports CSV/JSON → status `PENDING`
2. Mentor reviews in `app/admin/questions`; can request AI suggestion (`/api/admin/questions/[id]/suggest`) — returns but does not persist
3. Mentor approves (sets `correctAnswer`) or rejects → status updated
4. Approved questions appear in student question bank filtered by their active weekly plan's subjects

**V2 study system:** Users with `appVersion: "v2"` see Fase 1/2/3 instead of the V1 dashboard/weekly-plan. The two systems are parallel — V2 does not use `StudyLog`. V2 flow:
1. Admin builds curriculum: SubjectV2 → ContentV2 → TopicV2 in `/admin/v2/catalogo`
2. Mentor creates the student's **first cycle** via `/admin/students/[id]/grade` → Fase 1 tab: picks topics from the catalog (topics already studied in previous cycles are flagged), sets a `cycleLabel`, submits → a new `StudyGrid` is created with `active: true`
3. **Fase 1** (`/student/fase1`): student checks off `StudyTopicBlock.completed`; pie chart shows % per subject; colors customizable via `SubjectColorPreference`; completed previous cycles shown as achievements in the sidebar
4. **Fase 2** (`/student/fase2`): per completed topic, student checks `f2Bool1..5` (cadernos de erro)
5. **Fase 3** (`/student/fase3`): student fills in `SimulationBlock.studentResult` ("X/Y") and `studentNotes` per simulado
6. When mentor is ready for the next cycle, they **manually close** the current cycle (PATCH `/api/admin/students/[id]/cycles/[cycleId]/close`), then create a new one — the old grid becomes `active: false` with `completedAt` set
- Admin analytics in `/admin/v2/dashboard`: funnel KPIs, per-student funnel chart, simulation trend chart
- Admin grade page (`/admin/students/[id]/grade`): 3 tabs — **Fase 1** (CycleManager + StudyGridEditor for active cycle), **Fase 2** (viewer), **Fase 3** (SimulationEditor)

**Session tracking:**
- Capture: `authOptions` events (`signIn` / `signOut`) + `HeartbeatEmitter` client component in both admin and student layouts (pings `POST /api/user/heartbeat` every 10 min)
- Panel: `GET /api/admin/access-log` + `/admin/access-log` page — restricted to `isMasterAdmin`; shows KPIs (active now, sessions today, total, avg duration) + paginated table with name/email filter
- Cleanup: sessions older than 90 days deleted probabilistically (~1% of heartbeat calls)
- Menu item "Acessos" only in `adminItems` (not `mentorItems`)

**Cycle API endpoints:**
- `GET /api/admin/students/[id]/cycles` — list all cycles
- `GET /api/admin/students/[id]/cycles?catalog=1` — full catalog annotated with `studied: bool` per topic
- `POST /api/admin/students/[id]/cycles` — create new cycle (`{ cycleLabel, topicV2Ids[] }`); rejects if active cycle exists
- `PATCH /api/admin/students/[id]/cycles/[cycleId]/close` — close active cycle manually

**Markdown in questions:** `stem`, alternatives, and `commentary` use markdown. Rendered with `react-markdown` + `@tailwindcss/typography`. Supported: `**bold**`, `*italic*`, `~~strikethrough~~`, `<u>underline</u>`.

**Bulk CSV format:** semicolon-delimited (`;`), max 500 rows, max 5 MB. Column names accepted in PT or EN.

**Landing page / CMS:** entities `Plan`, `FeaturedStudent`, `ChangelogEntry`, `MethodItem` are managed via `/admin/landing`. ISR revalidation at 3600 s; on-demand via `/api/admin/metrics/revalidate`.

**Releasing changelog entries:** create `scripts/seed-changelog-vX.ts` following the pattern of existing scripts, then run with `DATABASE_URL` pointing to production.

**Theme:** dark mode only (`ThemeProvider` is fixed). Do not add light-mode variants.

**Commit convention:** `feat/fix/chore(scope): descrição em português`

# OPERACAO-01

A monolithic full-stack web platform for managing student performance in public exam preparation.

## Features

- **Authentication**: Secure login with Role-Based Access Control (Admin/Student).
- **Student Dashboard**: Track weekly progress, daily logs, and subject distrubtion.
- **Study Log**: Validated form to input daily study sessions.
- **History**: View past study logs with filtering.
- **Admin Dashboard**: Leaderboard ranking based on performance score algorithm.
- **Modern UI**: Built with Next.js App Router, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod + React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/operacao-01.git
    cd operacao-01
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/operacao01?schema=public"
    NEXTAUTH_SECRET="your_secret_key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  Setup Database:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    npx tsx prisma/seed.ts
    ```

5.  Run Development Server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials

- **Email**: `admin@operacao01.com`
- **Password**: `admin123`

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (shadcn).
- `lib/`:
    - `auth/`: NextAuth configuration.
    - `db/`: Prisma client instance.
    - `metrics/`: Business logic for aggregating student data.
    - `validators/`: Zod schemas.
- `prisma/`: Database schema and migrations.
- `tests/`: Validation scripts and E2E tests.

## Validation Scripts

Run these scripts to verify system logic without needing the UI:

- `npx tsx tests/validate-studylog.ts` (Form validation logic)
- `npx tsx tests/validate-metrics.ts` (Dashboard aggregation logic)
- `npx tsx tests/validate-admin.ts` (Ranking algorithm logic)
- `npx tsx tests/validate-history.ts` (History filtering logic)

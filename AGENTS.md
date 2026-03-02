# Voices Headless - Agent Instructions

## Cursor Cloud specific instructions

### Architecture Overview
This is a Next.js 14 monorepo for a multi-tenant voice-over agency platform ("Voices"). It serves 9 "Worlds" (business verticals) from a single Next.js app with smart routing. The database is hosted on Supabase (cloud) — there is no local database to run.

### Project Structure
- `/workspace/package.json` — Root, delegates dev/build to `1-SITE/apps/web`
- `/workspace/1-SITE/` — npm workspaces monorepo hub (`apps/*`, `packages/*`)
- `/workspace/1-SITE/apps/web/` — The Next.js 14 app (main application)
- `/workspace/1-SITE/packages/database/` — `@voices/database` (Drizzle ORM schemas)
- `/workspace/1-SITE/packages/config/` — `@voices/config` (MarketManager)

### Running the Application
- **Dev server**: `npm run dev` from repo root (runs on port 3000)
- **Lint**: `npm run lint` from repo root (runs `next lint` in `1-SITE/apps/web`)
- **Type check**: `cd 1-SITE/apps/web && npx tsc --noEmit`
- **Build**: `npm run build` from repo root

### Key Gotchas
- **ESLint config**: The repo may not include a `.eslintrc.json` in `1-SITE/apps/web/`. If `next lint` prompts interactively, create `1-SITE/apps/web/.eslintrc.json` with `{"extends": "next/core-web-vitals"}`.
- **TypeScript errors**: The codebase has known TS errors. `next.config.mjs` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for ESLint. The build will succeed despite type errors.
- **Two install locations**: Run `npm install` at both `/workspace` (root) and `/workspace/1-SITE` (workspace root). Both have their own `package-lock.json`.
- **Environment variables**: The app requires a `.env.local` file at `1-SITE/apps/web/.env.local` with Supabase credentials. Template at `1-SITE/apps/web/.env.example`. Without valid `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `DATABASE_URL`, the app starts but database-dependent features won't load data.
- **No Docker needed**: The entire app is a single Next.js process connecting to cloud Supabase. No Docker, no local DB.
- **Node.js**: Requires v22+. The environment already has v22.22.0.
- **Package manager**: Uses npm (not pnpm/yarn/bun). Lockfiles at both root and `1-SITE/`.

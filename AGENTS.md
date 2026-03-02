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
- **ESLint config**: The repo's `.gitignore` excludes `.eslintrc.json`. If `next lint` prompts interactively, create `1-SITE/apps/web/.eslintrc.json` with `{"extends": "next/core-web-vitals"}`.
- **TypeScript errors**: The codebase has known TS errors. `next.config.mjs` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for ESLint. The build will succeed despite type errors.
- **Two install locations**: Run `npm install` at both `/workspace` (root) and `/workspace/1-SITE` (workspace root). Both have their own `package-lock.json`.
- **Environment variables**: The app requires a `.env.local` at `1-SITE/apps/web/.env.local`. Secrets `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are injected as environment variables. Write them into `.env.local` before starting the dev server. The Supabase URL is public: `https://vcbxyyjsxuquytcsskpj.supabase.co`.
- **No Docker needed**: The entire app is a single Next.js process connecting to cloud Supabase. No Docker, no local DB.
- **Node.js**: Requires v22+. The environment already has v22.22.0.
- **Package manager**: Uses npm (not pnpm/yarn/bun). Lockfiles at both root and `1-SITE/`.
- **Port 3000 cleanup**: When restarting the dev server, use `netstat -tlnp | grep 3000` to find the PID and kill it by PID. `lsof -i:3000` may miss IPv6 listeners.

# Voices Headless - Agent Instructions

## Cursor Cloud specific instructions

### Architecture Overview
This is a Next.js 14 monorepo for a multi-tenant voice-over agency platform ("Voices"). It serves 9 "Worlds" (business verticals) from a single Next.js app with smart routing. The database is hosted on Supabase (cloud) — there is no local database to run.

### Project Structure
- `/workspace/package.json` — Root monorepo with npm workspaces (`apps/*`, `packages/*`)
- `/workspace/apps/web/` — The Next.js 14 app (main application)
- `/workspace/packages/database/` — `@voices/database` (Drizzle ORM schemas)
- `/workspace/packages/config/` — `@voices/config` (MarketManager)
- `/workspace/docs/` — Documentation and data snapshots

### Running the Application
- **Dev server**: `npm run dev` from repo root (runs on port 3000)
- **Lint**: `npm run lint` from repo root (runs `next lint` in `apps/web`)
- **Type check**: `cd apps/web && npx tsc --noEmit`
- **Build**: `npm run build` from repo root

### Key Gotchas
- **ESLint config**: The repo's `.gitignore` excludes `.eslintrc.json`. If `next lint` prompts interactively, create `apps/web/.eslintrc.json` with `{"extends": "next/core-web-vitals"}`.
- **TypeScript errors**: The codebase has known TS errors. `next.config.mjs` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for ESLint. The build will succeed despite type errors.
- **Single install location**: Run `npm install` at the repo root. npm workspaces hoists all deps. There is only one `package-lock.json` at root.
- **Environment variables**: The app requires a `.env.local` at `apps/web/.env.local`. Secrets `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are injected as environment variables. Write them into `.env.local` before starting the dev server. The Supabase URL is public: `https://vcbxyyjsxuquytcsskpj.supabase.co`.
- **No Docker needed**: The entire app is a single Next.js process connecting to cloud Supabase. No Docker, no local DB.
- **Node.js**: Requires v22+.
- **Package manager**: Uses npm (not pnpm/yarn/bun). Single lockfile at root.
- **Port 3000 cleanup**: When restarting the dev server, use `netstat -tlnp | grep 3000` to find the PID and kill it by PID. `lsof -i:3000` may miss IPv6 listeners.
- **Vercel deployments**: A `VERCEL_TOKEN` secret is available. Use `npx vercel ls --token "$VERCEL_TOKEN"` to check deployments, or push to `main` to trigger a production deploy. You can also force a redeploy with an empty commit: `git commit --allow-empty -m "Redeploy" && git push origin main`.
- **DB connection**: The `core-internal/database/index.ts` must use the Supabase Pooler (port 6543), NOT the direct host (port 5432). The direct host gives `ECONNRESET`. If someone re-introduces pooler-to-direct rewriting, the `/studio/` page and other server-rendered routes will break.
- **Workshop media**: Workshop cards use images (.webp/.jpg) from Supabase Storage, not videos. The `WorkshopCard` detects media type by file extension. Aftermovie videos exist separately in `studio/workshops/videos/` but are not currently linked as workshop media.
- **Testing preference**: The project owner prefers terminal output and screenshots over screen recordings. Only record video for complex UI bug reproduction where it's truly necessary.
- **GlobalNav journey detection**: The GlobalNav uses URL pathname first, then worldId, then market_code to determine which World navigation to show. On `voices.be/studio/`, the worldId from handshakeContext is 1 (Agency), so pathname detection (`/studio/` → `'studio'`) must take priority. Do not revert to ID-first detection order.
- **React overrides**: Root `package.json` has `"overrides"` for `react` and `react-dom` to force a single React instance across the monorepo. Do not remove these — they prevent `styled-jsx` useContext crashes during static page generation.

### Voicy Chat (AI Assistant)
- Voicy Chat requires `GOOGLE_API_KEY` (Google Gemini) for AI responses. Without it, the chat returns a graceful offline message instead of crashing.
- The chat API (`/api/chat/`) uses `GeminiService` which expects `gemini-flash-latest` model.
- Butler actions (`isButlerAction: true`) are internal automation triggers (SET_CONFIGURATOR, SHOW_LEAD_FORM) — they are executed automatically via useEffect and hidden from the UI. Only user-facing actions (Offerte aanvragen, Stemmen bekijken) appear as buttons.

### SmartRouter & Routing
- The SmartRouter (`[...slug]/page.tsx`) resolves all dynamic routes via the `slug_registry` table. If a slug isn't registered, Lazy Discovery attempts to find actors/articles/workshops and auto-register them.
- `/studio/[slug]/page.tsx` intercepts all `/studio/*` paths before the SmartRouter. Studio sub-pages (quiz, doe-je-mee, contact, faq) are handled as special cases in this file — NOT in the SmartRouter.
- World prefixes (`studio`, `academy`, `ademing`, `johfrai`, `partners`, `freelance`, `casting`) are recognized as valid entry points so their sub-routes can fall through to CMS article lookup.

### Business Rules
- **Telephony script format**: IVR customers type ALL messages in ONE text field. They put filenames in brackets (e.g. `[welkom] Welkom bij... [wacht] Een moment geduld...`). The system detects the number of desired files from the bracket markers. This is a deliberate UX choice — do NOT split into separate text fields or build multi-message selectors.
- **No free trial for Telephony**: The "Gratis proefopname" concept does not exist in the Telefonie journey. The CastingDock shows "Stem boeken" / "Direct bestellen" instead.

### Deploying to Production
Push to `main` to trigger Vercel auto-deploy. Check status with `gh api repos/johfrah/voices-vercel/commits/<sha>/status` or `npx vercel ls --token "$VERCEL_TOKEN"`. Builds take ~2 minutes. If Vercel gives an internal error, retry — it's usually a transient infra issue in the `iad1` region.

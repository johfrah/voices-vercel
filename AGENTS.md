# Voices Headless - Agent Instructions

## ARCHITECTURE FUNDAMENTALS (MANDATORY READING)

This platform follows the **Bob-method** (architecture) and **Chris-Protocol** (discipline). Every agent MUST understand these core principles before writing any code.

### Mandatory Startup Handshake (PATH UPDATE)
Before first edit, read:
- `.cursorrules`
- `docs/1-MASTER-BLUEPRINTS/06-AGENTS-HANDSHAKE.md`
- `docs/1-MASTER-BLUEPRINTS/03-AGENT-ONBOARDING.md`
- Then the key rules listed in **Key Rules Files** below.

### The 9 Worlds (Business Verticals)
The platform serves 9 autonomous "Worlds" from a single Next.js app:

| ID | World | Lead | Domain/Path |
|:---|:---|:---|:---|
| 0 | Foyer | Mat | `/contact`, `/terms` (Global) |
| 1 | Agency | Voicy | `voices.be`, `/agency` |
| 2 | Studio | Berny | `voices.be/studio` |
| 3 | Academy | Berny | `voices.academy`, `/academy` |
| 5 | Portfolio | Laya | `johfrah.be` |
| 6 | Ademing | Mat | `ademing.be`, `/ademing` |
| 7 | Freelance | Chris | `/freelance` |
| 8 | Partner | Sally | `/partners` |
| 10 | Johfrai | Voicy | `johfrai.be`, `/johfrai` |
| 25 | Artist | Laya | `youssefzaki.eu`, `/artist/youssef` |

### ID-First Handshake (NON-NEGOTIABLE)
- Every route resolves through the `slug_registry` table to an `entity_id` (UUID).
- NEVER use hardcoded slugs for internal logic. Always resolve to entity_id first.
- The SmartRouter (`apps/web/src/app/[...slug]/page.tsx`) is the single entry point for all dynamic pages.
- Use `world_id` (integer) for World logic, NEVER string comparisons.

### MarketManager (Source of Truth)
- `MarketManager` (`apps/web/src/lib/system/core/market-manager.ts`) maps domains to markets to worlds.
- Hardcoded hostnames in components are FORBIDDEN. Use `market.market_code`.
- `localhost:3000` maps to Market 1 (voices.be) / World 1 (Agency) by default.
- Path-based World detection: `/studio` → World 2, `/academy` → World 3, `/ademing` → World 6, `/johfrai` → World 10.

### HTML Zero (LayoutInstruments)
No raw HTML tags (`<div>`, `<h1>`, `<p>`, `<section>`, `<main>`) in new components. Use ONLY LayoutInstruments from `@/components/ui/LayoutInstruments`:
- `ContainerInstrument` (replaces `<div>`)
- `HeadingInstrument level={1-6}` (replaces `<h1>`-`<h6>`)
- `TextInstrument` (replaces `<p>`, `<span>`)
- `SectionInstrument` (replaces `<section>`)
- `ButtonInstrument` (replaces `<button>`)
- `PageWrapperInstrument` (replaces `<main>`)

### Database Conventions
- ALL database columns, properties, and API payloads use `snake_case` exclusively.
- Supabase Pooler on port **6543**, NEVER port 5432 (causes ECONNRESET).
- Drizzle ORM schemas in `packages/database/src/schema/`.
- Raw SQL (`db.execute(sql...)`) for critical data fetches; no ORM abstraction guessing.

### Deployment Protocol
- Bump version in THREE places simultaneously: `apps/web/package.json`, `apps/web/src/app/Providers.tsx`, `apps/web/src/app/api/admin/config/route.ts`.
- ALWAYS run `npm run check:pre-vercel` before pushing.
- Commit format: `vX.Y.Z: [Message]`.
- Push to `main` triggers Vercel auto-deploy.

### Key Rules Files
For detailed rules, read these files in `.cursor/rules/`:
- `000-ATOMIC-TRINITY.mdc` — The Constitution (World/Market/Journey/Entity/Page/Instrument)
- `800-DNA-ROUTING.mdc` — Smart routing, World architecture, Sub-Foyer strategy
- `310-LAYOUT-INSTRUMENTS.mdc` — Full UI component catalog (HTML Zero)
- `200-CODE-INTEGRITY.mdc` — Code discipline, ID-First Handshake, stateless architecture
- `700-PUSH-AND-VALIDATE.mdc` — Push, build validation, forensic audit procedure
- `300-TONE-OF-VOICE.mdc` — Anti-AI-slop, Natural Capitalization, human copy

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

### Execution Lanes (Speed + Correctness)
- **Fast Lane (default)**: Use for most tasks, especially when multiple agents work in parallel.
  - Run targeted checks only (changed files, focused endpoint/UI smoke test).
  - Avoid full-repo lint/type-check unless the task touches shared infra, routing core, payments, auth, or DB schema.
  - Skip version bump and release-only audits unless user asks for a release/deploy.
- **Release Lane (explicit)**: Use when user asks to ship/deploy/release, or when pushing production-critical changes.
  - Run the full release protocol: version sync, full pre-flight checks, and deployment validation.
  - Follow `.cursor/rules/700-PUSH-AND-VALIDATE.mdc` and `.cursor/rules/200-CODE-INTEGRITY.mdc` strictly.

### Multi-Agent Parallel Protocol (Anti-Slowdown)
- Use 1 coordinator + max 3 worker agents in parallel.
- Split work into **non-overlapping scopes** (different folders/features) to prevent duplicate scans and merge conflicts.
- Reuse existing running dev servers and environment state whenever possible.
- Do not repeat identical commands back-to-back without new input or changed context.
- Worker output format: findings, exact file paths, minimal patch suggestion.

### Response Latency Policy
- Send a short acknowledgement immediately, then continue with progressive updates.
- Target near-instant first response for simple requests; for complex tasks, prioritize rapid acknowledgement and incremental delivery over long silent runs.

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
- **Testing preference (strict)**: Default to terminal output and screenshots. Do **NOT** record screen by default. Record video only when it is truly essential to prove a complex UI bug/fix, or when the user explicitly asks for video evidence.
- **Sandbox Test Safety (mandatory)**: Any test that can trigger external side effects (emails, payments, webhooks, SMS, third-party writes) MUST use sandbox/test mode or mocked endpoints. If sandbox is unavailable, use dry-run/read-only validation and explicitly report that side effects were not executed.
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

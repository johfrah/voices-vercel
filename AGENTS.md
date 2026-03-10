# Voices Headless - Agent Instructions

This file is the operational contract for agents working in this repository. Keep it practical, strict, and drift-free.

## Quick Start Checklist (Mandatory)

Before your first edit in a session:

1. Read `.cursorrules`.
2. Read `docs/1-MASTER-BLUEPRINTS/06-AGENTS-HANDSHAKE.md`.
3. Read `docs/1-MASTER-BLUEPRINTS/03-AGENT-ONBOARDING.md`.
4. Read the key rules in `.cursor/rules/`:
   - `000-ATOMIC-TRINITY.mdc`
   - `800-DNA-ROUTING.mdc`
   - `310-LAYOUT-INSTRUMENTS.mdc`
   - `320-THEME-PARITY.mdc`
   - `200-CODE-INTEGRITY.mdc`
   - `700-PUSH-AND-VALIDATE.mdc`
   - `300-TONE-OF-VOICE.mdc`

## Core Architecture (Non-Negotiable)

### The 9 Worlds

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

### ID-First Handshake

- Every public route resolves via `slug_registry` to `entity_id` (UUID).
- Never use hardcoded slugs for internal logic.
- SmartRouter entrypoint: `apps/web/src/app/[...slug]/page.tsx`.
- World logic must use numeric `world_id`, never string matching.

### MarketManager is Source of Truth

- File: `apps/web/src/lib/system/core/market-manager.ts`.
- No hardcoded hostnames in components; use `market.market_code`.
- `localhost:3000` defaults to Market 1 / World 1 unless pathname sets another world.

### HTML Zero (LayoutInstruments)

Use instrument components from `@/components/ui/LayoutInstruments` for new UI work:

- `ContainerInstrument`
- `HeadingInstrument`
- `TextInstrument`
- `SectionInstrument`
- `ButtonInstrument`
- `PageWrapperInstrument`

No raw `<div>`, `<h1>`, `<p>`, `<section>`, `<main>` in new components.

### Database Conventions

- Database/API payload keys use `snake_case`.
- Use Supabase Pooler port `6543` (not `5432`).
- Schemas live in `packages/database/src/schema/`.
- For critical fetches, prefer explicit `db.execute(sql...)` when integrity/caching is a concern.

## Cursor Cloud Specific Instructions

### Platform Overview

- Next.js 14 monorepo serving multiple Worlds from one app.
- Supabase is cloud-hosted; no local database is required.

### Important Paths

- `/workspace/package.json` (workspaces root)
- `/workspace/apps/web` (Next.js app)
- `/workspace/packages/database` (`@voices/database`)
- `/workspace/packages/config` (`@voices/config`)
- `/workspace/docs` (docs and snapshots)

### Standard Commands

- Cloud setup: `npm run setup:cloud`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Build: `npm run build`

### Execution Lanes

- Fast Lane (default): run targeted checks only.
- Release Lane (deploy/release tasks): run full pre-flight and deployment protocol.

### Multi-Agent Protocol

- 1 coordinator + max 3 workers.
- Use non-overlapping scopes per worker.
- Reuse existing dev server/process state when possible.
- Avoid running identical commands repeatedly with unchanged context.

### Mobile UX Acceptance Checklist (Mandatory for UI Changes)

When a task changes public UI or interaction flows, agents must validate both mobile and desktop behavior with explicit evidence.

Required mobile routes (minimum scope):
- `/agency/video`
- `/agency/commercial`
- `/checkout/configurator`
- `/cart`
- `/checkout`
- `/studio`

Acceptance criteria:
- Minimum tap target for primary controls: 44px.
- No overlay may block primary CTA buttons.
- Chat launcher must not obstruct checkout controls.
- Modal interactions must support close button + Escape + backdrop close.
- Filter controls and order controls must be easy to tap on mobile.
- Light and dark mode readability must be validated for changed controls.

Required report format:
- PASS/FAIL table per tested route.
- List of fixed issues.
- List of remaining risks/blockers.
- Walkthrough artifacts: at least 1 video and 3 screenshots for UI-heavy tasks.

### Git Workflow Preference (User Override)

- Default: direct push/merge to `main` is allowed.
- Only use branch-first safe deploy when the user explicitly asks for it.

### Known Gotchas

- If `next lint` asks setup questions, create `apps/web/.eslintrc.json` with:
  `{"extends": "next/core-web-vitals"}`.
- Build is configured to tolerate known TypeScript/eslint issues in some paths.
- Install dependencies only from repo root (`npm install`).
- Required runtime env file: `apps/web/.env.local`.
- Node.js 22+.
- Package manager: npm (single lockfile at root).
- For port 3000 cleanup, use `netstat -tlnp | grep 3000` and kill by PID.
- Keep root React overrides in `package.json`; do not remove.

## Product and Routing Rules

### Voicy Chat

- Requires `GOOGLE_API_KEY` for full responses.
- Chat API uses `GeminiService` and `gemini-flash-latest`.
- Butler actions are hidden automation events; only user-facing actions render as UI buttons.

### SmartRouter and Studio Routing

- SmartRouter resolves dynamic routes via `slug_registry`.
- `/studio/[slug]/page.tsx` intercepts `/studio/*` before SmartRouter.
- World prefixes (`studio`, `academy`, `ademing`, `johfrai`, `partners`, `freelance`, `casting`) are valid entry points.

### Business Rules

- Telephony scripts stay in one text field with bracket markers (`[welkom] ... [wacht] ...`).
- Telephony journey has no free trial concept.

## Testing and Safety

- Default evidence mode: terminal output + screenshots.
- Record video only for complex UI proof or explicit user request.
- For any UI change, verify readability in both light and dark mode (no white-on-white / black-on-black states) on affected pages and navigation overlays.
- Never run side-effectful tests (email/payments/webhooks/SMS) outside sandbox/mock mode.
- If sandbox is unavailable, use read-only or dry-run validation and report limits.

## Deployment Protocol (Release Lane)

1. Sync version in all three files:
   - `apps/web/package.json`
   - `apps/web/src/app/Providers.tsx`
   - `apps/web/src/app/api/admin/config/route.ts`
2. Run `npm run check:pre-vercel`.
3. Main branch is hard-gated by Husky (`.husky/pre-push` + `.husky/pre-merge-commit`) and must pass:
   - `npm run verify:workspace-lock`
   - `npm run type-check`
   - `npm run lint`
   - `npm run check:pre-vercel`
4. Commit using `vX.Y.Z: [Message]`.
5. Push to `main` to trigger Vercel deployment.
6. Verify deployment status using:
   - `gh api repos/johfrah/voices-vercel/commits/<sha>/status`
   - or `npx vercel ls --token "$VERCEL_TOKEN"`

## Maintenance Note

If a referenced path changes, update this file in the same commit as the path move to keep onboarding deterministic.

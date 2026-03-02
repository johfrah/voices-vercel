# Voices Headless - AGENTS.md

This file is the practical operating contract for coding agents in this repository.

## 1) Mandatory startup handshake (first action)

Before editing anything, read these files in order:
1. `.cursorrules`
2. `3-WETTEN/docs/1-MASTER-BLUEPRINTS/06-AGENTS-HANDSHAKE.md`
3. `3-WETTEN/docs/1-MASTER-BLUEPRINTS/03-AGENT-ONBOARDING.md`
4. `.cursor/rules/000-ATOMIC-TRINITY.mdc`
5. `.cursor/rules/200-CODE-INTEGRITY.mdc`
6. `.cursor/rules/310-LAYOUT-INSTRUMENTS.mdc`
7. `.cursor/rules/700-PUSH-AND-VALIDATE.mdc`
8. `.cursor/rules/800-DNA-ROUTING.mdc`

If any listed file is missing, report it and continue with the remaining files.

## 2) Architecture essentials (non-negotiable)

### 9 Worlds
| ID | World | Lead | Domain/Path |
|:---|:---|:---|:---|
| 0 | Foyer | Mat | `/contact`, `/terms` |
| 1 | Agency | Voicy | `voices.be`, `/agency` |
| 2 | Studio | Berny | `voices.be/studio` |
| 3 | Academy | Berny | `voices.academy`, `/academy` |
| 5 | Portfolio | Laya | `johfrah.be` |
| 6 | Ademing | Mat | `ademing.be`, `/ademing` |
| 7 | Freelance | Chris | `/freelance` |
| 8 | Partner | Sally | `/partners` |
| 10 | Johfrai | Voicy | `johfrai.be`, `/johfrai` |
| 25 | Artist | Laya | `youssefzaki.eu`, `/artist/youssef` |

### Routing and identity
- ID-first always: resolve route slugs through `slug_registry` to `entity_id` (UUID).
- Smart Router entrypoint: `apps/web/src/app/[...slug]/page.tsx`.
- Use `world_id` integers for World logic; avoid string-based world checks.

### MarketManager exclusivity
- Source of truth: `apps/web/src/lib/system/core/market-manager.ts`.
- No hardcoded hostnames in components.
- Use `market.market_code` and known path mappings (`/studio`, `/academy`, `/ademing`, `/johfrai`).

### UI composition standard
- For new UI code, use LayoutInstruments from `@/components/ui/LayoutInstruments`.
- Avoid raw layout/typography tags in new components where an instrument exists.

### Data and DB discipline
- Use `snake_case` for DB columns, payloads, and API contracts.
- Supabase Pooler is required on port `6543`; do not switch back to `5432`.
- For critical admin/dashboard integrity checks, prefer direct SQL where needed.

## 3) Repo map

- `apps/web/`: main Next.js 14 app.
- `packages/database/`: Drizzle schemas and DB tooling.
- `packages/config/`: shared configuration.
- `docs/` and `3-WETTEN/docs/`: reference and operational blueprints.

## 4) Runbook (Cursor Cloud)

### Setup and runtime
- Node.js 22+.
- Package manager: npm (single lockfile at repo root).
- Install dependencies once at repo root: `npm install`.
- Dev server: `npm run dev` (root, port 3000).

### Common commands
- Lint: `npm run lint` (root).
- Type check: `cd apps/web && npx tsc --noEmit`.
- Build: `npm run build` (root).
- Pre-flight: `npm run check:pre-vercel`.

### Environment notes
- Required file: `apps/web/.env.local`.
- Required secrets: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Public Supabase URL: `https://vcbxyyjsxuquytcsskpj.supabase.co`.

## 5) Known gotchas (do not regress)

- Keep React override pins in root `package.json` (`react`, `react-dom`).
- `GlobalNav` journey detection order is path-first; do not revert to ID-first fallback for `/studio`.
- Workshop card media is image-based (`.webp/.jpg`) from Supabase Storage.
- If `next lint` prompts for config, create `apps/web/.eslintrc.json` with:
  `{"extends": "next/core-web-vitals"}`.

## 6) Testing and validation expectations

- Docs-only edits: validate with file readback and `git diff`.
- Code edits: at minimum run targeted checks plus type-check and pre-vercel check when relevant.
- UI edits: provide manual validation with screenshots; record video only for complex UI bugs.

## 7) Versioning and deploy contract

When shipping code changes:
1. Sync version in:
   - `apps/web/package.json`
   - `apps/web/src/app/Providers.tsx`
   - `apps/web/src/app/api/admin/config/route.ts`
2. Run `npm run check:pre-vercel`.
3. Commit format: `vX.Y.Z: [message]`.
4. Push to `main` to trigger Vercel deploy.

## 8) Quick completion checklist for agents

- Handshake files read.
- No architecture/routing violations introduced.
- No hardcoded host/domain logic introduced.
- Relevant tests/checks run with evidence.
- Version sync done when required.
- Changes committed and pushed.

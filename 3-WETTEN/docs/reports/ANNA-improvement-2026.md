# ANNA Improvement Report 2026
**Agent:** Anna (Stability, Broken Links, Build Integrity)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from git status, route structure, and known deletions.

### P0 (CRITICAL – Stability Risk)

| # | Finding | Evidence |
|---|---------|----------|
| 1 | **Deleted routes zonder redirect** | Git status: `D 1-SITE/apps/web/src/app/account/mailbox/page.tsx`, `D 1-SITE/apps/web/src/app/studio/beheer/editie/[id]/page.tsx`, `D 1-SITE/apps/web/src/app/studio/beheer/page.tsx`, `D 1-SITE/apps/web/src/app/studio/launchpad/page.tsx` – bij merge naar main ontstaan 404's |
| 2 | **Orphaned links naar deleted routes** | `account/mailbox`, `studio/beheer`, `studio/launchpad` kunnen elders gelinkt zijn (GlobalNav, footer, account dashboard) |
| 3 | **Build integrity niet geautomatiseerd** | Geen CI check op `npm run lint` exit code; Vercel build kan falen zonder pre-push validatie |

### P1 (WARNING)

| # | Finding | Evidence |
|---|---------|----------|
| 1 | **Backup/legacy routes in app tree** | `studio/_[slug]_BACKUP/page.tsx`, `voice/_[slug]_BACKUP/` – potentieel verwarring en dubbele routes |
| 2 | **Geen 404-link scanner** | Geen script dat alle `href` en `Link` targets valideert tegen bestaande routes |

---

## 3 Masterclass Improvements (Concrete)

### 1. **404 Prevention Protocol**
- **Actie:** Bij delete van een page: (a) zoek alle referenties naar die route (`/account/mailbox`, `/studio/beheer`, `/studio/launchpad`), (b) voeg `redirects` toe in `next.config.ts` voor deprecated URLs naar relevante alternatieven.
- **Bestanden:** `next.config.ts`, `GlobalNav.tsx`, `AccountDashboardClient.tsx`, `GlobalFooter.tsx`.
- **Impact:** Geen verrassende 404's na deploy.

### 2. **Pre-Push Lint Gate**
- **Actie:** Husky pre-push hook: `npm run lint` in `1-SITE/apps/web`; exit 1 bij fouten.
- **Bestanden:** `.husky/pre-push`, `package.json`.
- **Impact:** Vercel build-failures voorkomen door linter eerst lokaal te laten falen.

### 3. **Link Audit Script**
- **Actie:** Script in `3-WETTEN/scripts/` dat alle `href="` en `<Link href=` extraheert, interne paden normaliseert en checkt tegen `src/app/**/page.tsx`-structuur. Rapport: "Broken: /studio/launchpad, /account/mailbox".
- **Impact:** Forensische bewijslast voor Anna; herhaalbare 404-scan.

---

## Files Requiring Attention

1. `next.config.ts` – redirects voor `/account/mailbox`, `/studio/beheer`, `/studio/launchpad`
2. `1-SITE/apps/web/src/components/ui/GlobalNav.tsx` – links naar deleted routes
3. `1-SITE/apps/web/src/app/account/AccountDashboardClient.tsx` – mailbox link
4. `.husky/pre-push` of `package.json` scripts

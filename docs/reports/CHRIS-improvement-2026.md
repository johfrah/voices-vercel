# CHRIS Improvement Report 2026
**Agent:** Chris (Code Integrity, Bob-methode Compliance)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence gathered from `3-WETTEN/scripts/watchdog.ts` run and codebase grep.

### P0 (CRITICAL – Blocks Deploy)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **Lucide icons zonder strokeWidth={1.5}** | `1-SITE/apps/web/src/app/Providers.tsx` L25 | Watchdog CRITICAL: Atomic Icon Mandate violation |
| 2 | **Leesbaarheid Mandate breach (text-xs / text-[8–14px])** | 31+ files including `GlobalNav.tsx`, `VoiceCard.tsx`, `OrderStepsInstrument.tsx`, `MailList.tsx`, `johfrai/page.tsx`, `CheckoutForm.tsx`, `WorkshopInterestForm.tsx` | Grep: `text-xs` and `text-[1-14]px` present across admin, studio, checkout, mailbox |
| 3 | **Zero-Uppercase Slop** | Multiple files in `globals.css`, admin, studio, mailbox, VoiceCard, GlobalNav | Grep: `uppercase` in 18+ files; Chris-Protocol forbids uppercase except metadata <10px |

### P1 (WARNING – Technical Debt)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **DOM Manipulation verboden** | `admin/mailbox/page.tsx` L276, L284; `VoicyBridge.tsx` L67; `AcademyPdfButton.tsx` L25 | `document.getElementById`, `document.querySelector` gebruikt – Chris-Protocol: React State + Refs only |
| 2 | **Raw `<a href>` in plaats van `<Link>`** | `portfolio/johfrah/contact/page.tsx`, `portfolio/johfrah/page.tsx`, `studio/instructeurs/[slug]/page.tsx`, `ArtistDetailClient.tsx` L65 (`href="#"`), `ArtistHeroInstrument.tsx` | External links + anchor links; Next.js mandates `<Link>` voor in-app navigatie |
| 3 | **Kale HTML tags i.p.v. Layout Instruments** | `1-SITE/apps/web/src/app/[slug]/page.tsx` – 30+ WARNING lines | Watchdog: `div`, `span`, `p` zonder `ContainerInstrument`/`TextInstrument`/`SectionInstrument` |
| 4 | **Mobile-First spacing niet afgedwongen** | `[slug]/page.tsx`, meerdere secties | Watchdog: `p-[0-9]+`/`m-[0-9]+` zonder `md:` overrides |

---

## 3 Masterclass Improvements (Concrete)

### 1. **Watchdog Pre-Commit Hook**
- **Actie:** Voeg `npm run watchdog` toe aan pre-commit (of `lint:watchdog`) en faal de commit bij CRITICAL issues.
- **Bestand:** `package.json` scripts + `.husky/pre-commit` of `lint-staged`.
- **Impact:** Geen nieuwe CRITICAL violations meer in main.

### 2. **DOM-Manipulation Refactor**
- **Bestanden:** `admin/mailbox/page.tsx`, `VoicyBridge.tsx`, `AcademyPdfButton.tsx`
- **Actie:** Vervang `document.getElementById`/`document.querySelector` door `useRef` + React state. Bijv. in mailbox: `scrollIntoView` op een ref in plaats van `document.getElementById`.
- **Impact:** Chris-Protocol Modern Stack Discipline compliant.

### 3. **Instrument-Migratie `[slug]/page.tsx`**
- **Bestand:** `1-SITE/apps/web/src/app/[slug]/page.tsx` (~50 WARNING lines)
- **Actie:** Systematisch `div` → `ContainerInstrument`, `span`/`p` → `TextInstrument`, `section` → `SectionInstrument`. Voeg `md:` spacing toe waar mobile-first ontbreekt.
- **Impact:** Referentie-pagina voor Bob-methode compliance; vermindert watchdog noise.

---

## Files Requiring Immediate Attention

1. `1-SITE/apps/web/src/app/Providers.tsx` – icon strokeWidth
2. `1-SITE/apps/web/src/app/admin/mailbox/page.tsx` – DOM manipulation
3. `1-SITE/apps/web/src/app/[slug]/page.tsx` – Layout Instruments + spacing
4. `1-SITE/apps/web/src/components/ui/GlobalNav.tsx` – text-xs/uppercase
5. `1-SITE/apps/web/src/components/studio/WorkshopInterestForm.tsx` – raw `<button>`, uppercase defaultText

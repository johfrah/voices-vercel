# LEX Improvement Report 2026
**Agent:** Lex (Legal Compliance, Privacy, Security Hardening)  
**Date:** 13 February 2026  
**Protocol:** Evidence-based, P0/P1 priorities, zero slop

---

## Audit Summary

Evidence from CookieBanner, privacy routes, API security, and legal pages.

### P0 (CRITICAL – Compliance)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **CookieBanner: geen link naar cookiebeleid** | `Legal/CookieBanner.tsx` | Tekst "Wij gebruiken cookies..." maar geen link naar `/cookies` of `/privacy` – GDPR transparantie eist toegang tot volledige info |
| 2 | **localStorage consent zonder audit trail** | `CookieBanner.tsx` L31–34 | `localStorage.setItem('voices_cookie_consent', type)` – geen timestamp, geen versie; bij wijziging beleid geen her-bevestiging flow |
| 3 | **API routes: inline HTML in emails** | `api/translations/heal/route.ts`, `api/admin/voiceglot/heal-all/route.ts` | `<a href="..." style="...">` – geen unsubscribe, geen privacy notice in footer; mogelijk marketing-email compliance issue |

### P1 (WARNING)

| # | Finding | File(s) | Evidence |
|---|---------|---------|----------|
| 1 | **CookieBanner font-black** | `CookieBanner.tsx` L60 | "font-black tracking-widest" op "Accepteer" – Natural Cap + Raleway light voor koppen; buttons kunnen medium, niet black |
| 2 | **Geen robots meta op gevoelige routes** | admin, backoffice, account | Mogelijk `noindex` op /admin, /backoffice; account mixed – te valideren |
| 3 | **Terms/Privacy pages: dynamische content** | `terms/page.tsx`, `privacy/page.tsx` | Check of content uit DB komt en juridisch reviewed is |

---

## 3 Masterclass Improvements (Concrete)

### 1. **CookieBanner Policy Link**
- **Actie:** Voeg onder de cookie-tekst een link toe: `<Link href="/cookies"><VoiceglotText translationKey="legal.cookie.learn_more" defaultText="Meer info" /></Link>` of direct naar `/privacy#cookies`.
- **Bestand:** `1-SITE/apps/web/src/components/ui/Legal/CookieBanner.tsx`.
- **Impact:** GDPR transparantie; gebruiker kan beleid raadplegen voor keuze.

### 2. **Consent Metadata**
- **Actie:** Sla bij `handleAccept` ook op: `{ type, timestamp: Date.now(), version: '2026.1' }` in localStorage. Bij load: als `version` ouder is dan huidige, toon banner opnieuw.
- **Bestand:** `CookieBanner.tsx`.
- **Impact:** Her-bevestiging bij beleidswijziging; audit trail voor compliance.

### 3. **Email Template Compliance**
- **Actie:** API routes die emails sturen: voeg footer toe met link naar privacy + unsubscribe (indien marketing). Gebruik gedeelde template in `lib/email-templates.ts`.
- **Bestanden:** `api/translations/heal/route.ts`, `api/admin/voiceglot/heal-all/route.ts`.
- **Impact:** Lex-compliant uitgaande communicatie.

---

## Files Requiring Attention

1. `1-SITE/apps/web/src/components/ui/Legal/CookieBanner.tsx` – policy link, consent metadata
2. `1-SITE/apps/web/src/app/api/translations/heal/route.ts` – email footer
3. `1-SITE/apps/web/src/app/api/admin/voiceglot/heal-all/route.ts` – email footer

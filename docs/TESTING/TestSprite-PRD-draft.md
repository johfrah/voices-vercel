# Voices – Product requirements (draft for TestSprite)

Korte productbeschrijving voor TestSprite MCP: multi-tenant voice-over platform met meerdere “Worlds” (business verticals) in één Next.js-app.

---

## Product overview

- **Name:** Voices (voices.be, johfrah.be, ademing.be, youssefzaki.eu, etc.)
- **Stack:** Next.js 14, React, Supabase (DB + Storage), Vercel.
- **Type:** Multi-tenant web app; frontend + API routes (Next.js API routes).

---

## Main user flows to test

1. **Public site (Agency World)**
   - Homepage, navigatie, wereld-specifieke menu’s (Studio, Academy, Ademing, Johfrai, etc.).
   - Actor/voice-over zoeken en profielen bekijken.
   - Contact/formulieren (per World).

2. **Studio World** (`/studio`, `voices.be/studio`)
   - Workshop-overzicht, workshop-detail, inschrijving/info.
   - Geen raw HTML; gebruik van LayoutInstruments (design system).

3. **Academy World** (`/academy`)
   - Leeromgeving, cursussen, navigatie.

4. **Ademing World** (`/ademing`, ademing.be)
   - Meditatie/ademing-dashboard en content.

5. **Portfolio / Freelance** (`johfrah.be`, `/freelance`)
   - Portfolio-pagina’s, commissies, vakmanschap.

6. **Account / Auth** (indien test-account beschikbaar)
   - Inloggen, account-dashboard, partner-dashboard.

7. **APIs**
   - Next.js API routes onder `/api/` (chat, config, webhooks, etc.).
   - Geen hardcoded hostnames; gebruik van MarketManager/market_code.

---

## Technical constraints (relevant for tests)

- **Routing:** Alle dynamische routes via SmartRouter + `slug_registry` (entity_id). Geen hardcoded slugs in core logic.
- **UI:** Alleen LayoutInstruments (geen raw `<div>`, `<h1>`, etc.) in nieuwe componenten.
- **Data:** Database en API in `snake_case`; Supabase Pooler op poort 6543.
- **Markets:** MarketManager is de bron voor host/domain → market/world; geen `host.includes()` in componenten.

---

## Out of scope for this PRD

- Backoffice/admin-only flows (tenzij expliciet als testscope toegevoegd).
- Betalingen/Stripe/Mollie (alleen met sandbox/test mode).
- E-mail/SMS (sandbox of mocks).

---

*Dit document is een draft voor TestSprite bootstrap. TestSprite kan hieruit een genormaliseerde PRD en testplan afleiden.*

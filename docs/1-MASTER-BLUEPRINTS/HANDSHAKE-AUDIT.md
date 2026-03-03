# Handshake-audit – waar taal/world uit handshake komen

**Doel:** Eén bron van waarheid (server handshake: `worldId`, `languageId`) zodat header, menu, filters en wereld-specifieke UI overal dezelfde taal en world tonen.

---

## Al gebruik van handshake

| Plek | Gebruik |
|------|--------|
| **Layout / Providers** | `handshakeContext` wordt server-side opgebouwd en in `Providers` op `window.handshakeContext` gezet. |
| **GlobalNav / GlobalNavInstrument** | `worldId`, `languageId` uit handshake voor navigatie-highlight en taallogica. |
| **LanguageSwitcher(s)** | Init en sync van `currentLangId` uit `handshakeContext.languageId` (header + menu consistent). |
| **WorkshopInterestForm(s)** | `worldId` uit handshake voor inschrijving. |
| **InstrumentRenderer** | `worldId` uit handshake. |
| **Providers (re-run context)** | Bij pathname-change: handshake heeft voorrang op client-side `resolveContext`. |

---

## Aangepast in deze audit

| Plek | Aanpassing |
|------|------------|
| **VoicesMasterControlContext** | Bij init en bij `resetFilters`: als er geen taalcodes in de URL zitten, wordt de standaardtaal (en -id) afgeleid van `handshakeContext.languageId` (en registry), daarna market. Filter sluit daarmee aan op de pagina-taal (bv. cookie/header). |
| **AgencyFilterSheet / AgencyFilterSheetInstrument** | `worldId` voor de taallijst: `handshake?.worldId ?? getWorldId(market.market_code)`, zodat op bv. `/studio` de juiste world-talen getoond worden. |

---

## Optioneel / niet aangepast

- **TranslationContext** – Krijgt `lang` van layout (zelfde bron als handshake); geen wijziging nodig.
- **VoiceglotText** – `sourceLangId`/brontekst blijft bewust `market.primary_language_id` (nl-be als bron); geen handshake.
- **API-routes** – Ontvangen taal vaak via header/body; handshake is client-only; server gebruikt eigen `resolveContext` in layout. Geen client-handshake in API nodig.
- **ReviewsInstrument** – Krijgt `worldId` als prop; aanroepers kunnen handshake gebruiken waar van toepassing.

---

## Aanbeveling

Bij nieuwe client-componenten die **huidige taal** of **huidige world** nodig hebben:

- **Taal:** `(window as any).handshakeContext?.languageId` (en eventueel taalcode uit `MarketManager.languages`).
- **World:** `(window as any).handshakeContext?.worldId`.

Daarmee blijft alles in lijn met de server-render en voorkom je inconsistenties (zoals nl in de header en de in het menu).

# 🚀 LIVE-READY AUDIT & LOCK-PROTOCOL (Voices 2026)

Dit document dient als de definitieve checklist voor de livegang van **Voices**. Het combineert de status van de "Masterclass" code met de acties die nog nodig zijn voor de lancering.

## 🔒 GECONTROLEERD & GELOCKT (Masterclass Status)
De volgende onderdelen zijn 100% stabiel en beveiligd met het `@lock-file` protocol:

| Onderdeel | Bestand | Status | Waarom Lock? |
| :--- | :--- | :--- | :--- |
| **Slimme Kassa** | `src/lib/pricing-engine.ts` | ✅ LOCKED | Voorkomt fouten in prijsberekeningen en legacy formules. |
| **Grondwet** | `.cursorrules` | ✅ LOCKED | Bewaakt de Bob-methode en het Chris-Protocol. |
| **Agent Wetten** | `.cursor/rules/*.mdc` | ✅ LOCKED | Garandeert consistente uitvoering door alle AI-agenten. |
| **Ruggengraat** | `packages/database/schema.ts` | ✅ LOCKED | Nieuwe Artist, OrderItems en Academy structuren zijn definitief. |
| **Smart Router** | `src/app/[...slug]/page.tsx` | ✅ LOCKED | Artist & Actor DNA resolutie werkt naadloos. |
| **Kassa API** | `src/app/api/checkout/mollie/route.ts` | ✅ LOCKED | Betalingsvalidatie en metadata-opslag zijn kritiek. |
| **Esthetiek** | `src/components/ui/LayoutInstruments.tsx` | ✅ LOCKED | De visuele bouwstenen van de Voices-Mix. |
| **Vertaling** | `src/lib/voiceglot-bridge.ts` | ✅ LOCKED | De brug naar de meertalige etalage. |
| **Middleware** | `src/middleware.ts` | ✅ LOCKED | De Traffic Controller van het ecosysteem. |

---

## 🛠️ AUDIT: WAT MOET NOG OP SLOT? (Live-Ready Kandidaten)
De volgende bestanden werken goed, maar moeten een laatste "Chris-Audit" ondergaan voor ze bevroren worden:

### 1. De Server API (API Server)
*   **Bestand**: `src/lib/api-server.ts`
*   **Status**: ✅ LOCKED
*   **Actie**: Error-handling bij missende slugs verbeterd met server-logs.

---

## 📋 DE LIVE-READY CHECKLIST (Pre-Launch)

### 🎭 Journey Validatie
- [x] **Artist**: Youssef is een Artist van het muzieklabel (Luxe Black DNA).
- [ ] **Agency**: Werkt de casting-flow en de winkelmand-sync?
- [ ] **Voice Actor**: Zijn de profielpagina's 'Luxe Black' en zonder casting-ruis?
- [ ] **Portfolio**: Zijn de Johfrah-pagina's warm, zonder grayscale en met `max-w-5xl`?
- [ ] **Ademing**: Is de sfeer sereen en de typografie `font-light`?

### 💳 Commerciële Flow
- [x] **Metadata**: Volledige prijsopbouw (Usage/Metadata) wordt opgeslagen bij orders.
- [ ] **Mollie**: Test-transactie succesvol voor zowel Workshops als Voice-overs?
- [x] **BTW-Check**: Automatische validatie voor EU-bedrijven via VIES/VatComply proxy werkt.
- [ ] **Facturatie**: Worden de PDF's correct gegenereerd via de Slimme Kassa?

### 🕸️ SEO & LLM Readiness (Suzy)
- [x] **Schema.org**: Artists hebben `MusicGroup` schema, Acteurs hebben `Service`.
- [x] **Sitemap**: Dynamische sitemap is compleet met alle core routes en slugs.
- [x] **Robots.txt**: Audio-assets beschermd tegen scraping, AI-bots geblokkeerd.

### 🚀 Technische Performance (Anna)
- [ ] **100ms LCP**: Laden de hero-secties overal binnen de Moby-norm?
- [ ] **Linter Clean**: Geeft `npm run lint` nul fouten in de web-app?
- [ ] **Vercel Edge**: Zijn de API routes geoptimaliseerd voor de Edge runtime?

---

## 🏁 DE FINALE KLAP (Het Live-Mandaat)
Zodra bovenstaande lijst op "Groen" staat, roepen we **Bob** op voor de 'Golden Standard Check'. Pas na zijn akkoord wordt de DNS omgezet en de show gestart.

**Chris-Protocol Advies**: "Lock liever te vroeg dan te laat. Als het werkt, blijf eraf."

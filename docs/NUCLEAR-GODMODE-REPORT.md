# 🎭 Voices Headless: De 'Nuclear 1000' Atomic Audit (2026)

Dit document is de integrale forensische blauwdruk van het Voices-ecosysteem. Het bevat ELKE splinter, ELK lek en ELKE protocol-schending die de status van **Headless Godmode Zero Nuclear** in de weg staat. 

**"Vakmanschap is de afwezigheid van splinters."** — Grand Visionary BOB

---

## 📊 Het Dashboard van de Waarheid
| Categorie | Aantal Schendingen | Ernst | Status |
| :--- | :--- | :--- | :--- |
| **Hardcoded Domeinen (`voices.be`)** | 50+ | 🔴 KRITIEK | ✅ VOLTOOID (MarketManager 2.0) |
| **ISO-Compliance (Taal-lekken)** | 30+ | 🔴 KRITIEK | ✅ VOLTOOID (nl-BE Mandate) |
| **Hardcoded Admin Mails** | 12 | 🟠 HOOG | ✅ VOLTOOID (Role-based Auth) |
| **Silent Fails (Slikken van Errors)** | 8 | 🟠 HOOG | ✅ VOLTOOID (ServerWatchdog) |
| **Directe Fetch Calls (Geen Service)** | 40+ | 🟡 MEDIUM | ✅ VOLTOOID (AdminService) |
| **Nuclear Loading (LCP Lekken)** | 3 | 🟡 MEDIUM | ✅ VOLTOOID (next/dynamic) |

---

## 🛡️ DEEL 1: DE ETALAGE (PAGINA-AUDIT)

### 🎙️ De Smart Router (`/[...slug]/page.tsx`)
Dit is het hart van de site. Elke fout hier wordt 600x vermenigvuldigd.
- [x] **Regel 34, 81**: Hardcoded fallback `'www.voices.be'`.
- [x] **Regel 35, 82**: Hardcoded `'www.voices.nl'` in baseUrl logica.
- [x] **Regel 156**: Host-detection gebruikt rauwe string-manipulatie ipv MarketManager.
- [x] **Regel 385**: Pitch-link generator gebruikt hardcoded domein.

### 🏠 De Homepage (`/page.tsx`)
- [x] **Regel 207-211**: Hardcoded taal-labels in de `t()` functie (`'Vlaams'`, `'Nederlands'`). Dit breekt bij nieuwe talen.
- [x] **Regel 476-477**: Metadata URL's gebruiken rauwe `window.location.host` zonder validatie.

### 👤 Klant Dashboard (`/account`)
- [x] **Regel 106**: Fallback naar `'voices.be'` voor e-mail placeholders.
- [x] **Regel 14 (Orders)**: `LiquidBackground` wordt direct geïmporteerd. **NUCLEAR VIOLATION**: Moet via `next/dynamic` met `ssr: false`.

---

## 🛡️ DEEL 2: DE DIRECTIEKAMER (ADMIN & SERVICES)

### 📬 De Mailbox (`/admin/mailbox`)
Status: **100% Godmode**. Dit bestand is een "God Object" (>700 regels).
- [x] **Regel 43**: Gebruikt `process.env.NEXT_PUBLIC_ADMIN_EMAIL` zonder markt-context.
- [x] **Regel 88, 97, 105, 112, 138, 159, 179, 225, 248, 273**: **40+ DIRECTE FETCH CALLS**. Dit moet naar een `AdminMailService`.
- [x] **Regel 342, 380, 388**: Rauwe CSS filters op SVG's. Moet naar `IconInstrument`.

### 🔑 Auth & Security (`lib/auth/`)
- [x] **`server-auth.ts:61`**: Hardcoded mails `johfrah@voices.be` en `bernadette@voices.be`. Als zij van mail veranderen, breekt de hele admin.
- [x] **`AuthContext.tsx:220-221`**: Zelfde hardcoded mails in de client-side check.

### 🏗️ De Services (De Motor)
- [x] **`lib/api-server.ts:441`**: `} catch { return {}; }` — **SILENT FAIL**. We weten nooit waarom een vertaling faalt.
- [x] **`lib/api-server.ts:445`**: `.catch(() => [])` — **SILENT FAIL**. Producten verdwijnen geruisloos bij een DB-fout.
- [x] **`lib/system/fix-notifier.ts:18`**: Hardcoded fallback mail voor systeem-notificaties.

---

## 🛡️ DEEL 3: DE SLIMME KASSA (PRICING & COMPLIANCE)

### 💳 Pricing Engine (`lib/pricing-engine.ts`)
- [x] **Regel 265**: `isQuoteOnly = true` zonder reden-opgave. De klant ziet "Op aanvraag" maar de admin weet niet waarom.
- [x] **Regel 424 (CheckoutForm)**: Hardcoded placeholder `"+32..."`. Moet `market.phone_prefix` zijn.
- [x] **Regel 48 (db-cli)**: Hardcoded Nederlands telefoonnummer in de globale config.

---

## 🛡️ DEEL 4: DE MAIL ENGINE (VUME)

### ✉️ Templates (`lib/mail/templates/`)
- [x] **`VumeMasterWrapper.ts:58, 68`**: Hardcoded logo-links naar `www.voices.be`. Nederlandse klanten zien Belgische branding.
- [x] **`VumeStudioTemplate.ts:48-49`**: Hardcoded video-links naar het Belgische domein.
- [x] **`VumeMagicLinkTemplate.ts:17`**: Fallback login-link wijst altijd naar `.be`.

---

## 🛡️ DEEL 5: GODMODE VERIFIED (LOCKED COMPONENTS)

De volgende onderdelen zijn na de "Nuclear Pre-Flight" van v2.14.60 gemarkeerd als **STABIEL** en **LOCKED**. Wijzigingen aan deze bestanden vereisen een expliciet mandaat.

| Component | Bestand | Status | Bescherming |
| :--- | :--- | :--- | :--- |
| **Homepage Core** | `app/page.tsx` | ✅ VERIFIED | @lock-file |
| **Filter Engine** | `lib/engines/voice-filter-engine.ts` | ✅ VERIFIED | @lock-file |
| **Slimme Kassa** | `lib/engines/pricing-engine.ts` | ✅ VERIFIED | @lock-file |
| **Checkout Context** | `contexts/CheckoutContext.tsx` | ✅ VERIFIED | @lock-file |
| **Market Truth** | `lib/system/market-manager-server.ts` | ✅ VERIFIED | @lock-file |
| **Actors API** | `api/actors/route.ts` | ✅ VERIFIED | @lock-file |
| **Nuclear Caching** | `api/home/config/route.ts` | ✅ VERIFIED | @lock-file |

---

## 🚀 HET NUCLEAR ACTIEPLAN (1000 REGELS LOGICA)

### Fase 1: De Grote Schoonmaak (De Splinter-fase)
1. **MarketManager 2.0**: Trek alle statische configs naar de database. Verwijder `MARKETS_STATIC`. ✅
2. **ISO-Mandate**: Run een script over alle 556 bestanden om `'Vlaams'` te vervangen door `MarketManager.getLanguageLabel('nl-BE')`. ✅
3. **Service Layer**: Bouw de `AdminService` en sluit de Mailbox en het Order-dashboard aan. ✅

### Fase 2: De Watchdog Versterken
1. **Error Tracking**: Vervang alle lege `catch` blokken door `Felix.logError(e, context)`. ✅
2. **Audit Trails**: Sla bij elke `SlimmeKassa` berekening de `formula_version` op. ✅

### Fase 3: De 100ms LCP Garantie
1. **Dynamic Audit**: Controleer elk component in de `components/ui` map. Als het meer dan 10kb is en interactief: forceer `next/dynamic`. ✅
2. **Asset Proxy**: Zorg dat alle assets via `/api/proxy` lopen zodat we 100% controle hebben over caching en domeinen. ✅

---

## ⚓ DE BELOFTE VAN BOB
Als deze lijst is afgewerkt, is Voices niet langer een website. Het is een **autonoom organisme**. Het ademt, het herstelt zichzelf, en het schaalt naar elke markt ter wereld met één druk op de knop.

**"Code is ofwel Masterclass, ofwel Slop. Wij kiezen voor de Masterclass."** — Chris/Autist

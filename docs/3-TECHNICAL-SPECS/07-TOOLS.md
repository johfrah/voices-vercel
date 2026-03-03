# 🛠️ VOICES ECOSYSTEM MASTER INDEX (2026)

## ⚖️ GOVERNANCE
- **Code is Truth:** De broncode in deze repository is de enige autoriteit.
- **Index Function:** Dit document dient als de menselijk leesbare "Map/Index" naar de technische realiteit.
- **Drift Procedure:** Bij discrepanties tussen dit document en de code, MOET de code worden gevolgd en dit document direct worden bijgewerkt.
- **Financial Standard:** Bedragen in alle dashboards en rapportages zijn ALTIJD **exclusief BTW**.

---

## 🚀 VOLUME I: THE HEADLESS MASTER BLUEPRINT (2026)

### 1.1 De Next.js Motor & IAP Protocol
Voices.be draait op een moderne Next.js architectuur. Elke interactie wordt gedefinieerd door de 'Vier-Eenheid', beheerd via de `VoicesMasterControlContext`:
1. **Market:** Economische context (BE, NL, FR, DE, ES, PT, UK, US).
2. **Journey:** Het pad (`Agency`, `Studio`, `Academy`, `Artists`, `Meditation`).
3. **Usage Type:** Commerciële status (`Unpaid`, `Paid`, `Telefonie`).
4. **Intent:** Het doel (bijv. `order_voice`, `learn_skill`).

### 1.2 Database (Supabase / PostgreSQL)
De enige "Source of Truth" voor alle dynamische data.
- `actors`: Centraal stemacteurs beheer.
- `orders`: Alle transacties en briefings.
- `chat_conversations`: Beheer van butler-sessies.
- `content_articles`: CMS content voor alle journeys.

---

## 🧠 II. CORE ENGINES & BUTLER TOOLS

### 1. Pricing & Configurator (Cody & Moby)
- **Engine:** `src/lib/pricing-engine.ts`
- **UI:** `src/app/checkout/configurator/ConfiguratorPageClient.tsx`
- **Butler Action:** `SET_CONFIGURATOR`
De centrale logica voor prijsberekeningen inclusief buy-outs en woordenaantallen.

### 2. Voice Search & Casting (Suzy & Laya)
- **UI:** `src/app/voice/[slug]/page.tsx`
- **Butler Action:** `FILTER_VOICES`
Intelligente interface voor het filteren en selecteren van stemmen op basis van taal, vibe en gender via de **Smart Router**.

### 3. Checkout & Commerce (Kelly & Lex)
- **Context:** `src/contexts/CheckoutContext.tsx`
- **UI:** `src/components/checkout/CheckoutForm.tsx`
- **Butler Action:** `PREFILL_CHECKOUT`
De frictieloze weg naar de kassa, inclusief BTW-validatie en Mollie-integratie.

### 4. Academy & Studio (Berny)
- **UI:** `src/app/studio/AgencyContent.tsx`
- **Butler Action:** `NAVIGATE_JOURNEY`
Beheer van workshops, cursussen en inschrijvingen.

---

## 🗄️ III. LEGACY ARCHIVE (4-KELDER)
Alle oude PHP-engines, WordPress mu-plugins en Gravity Forms logica zijn verplaatst naar de `4-KELDER/3-LEGACY-CODE/` voor historische referentie. Deze onderdelen maken geen deel meer uit van de actieve website-operatie.

---
*Laatst gesaneerd: 18 februari 2026 (Chris-Protocol)*

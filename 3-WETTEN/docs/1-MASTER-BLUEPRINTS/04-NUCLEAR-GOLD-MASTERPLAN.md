# 🚀 NUCLEAR GOLD: HET TRANSFORMATIE MASTERPLAN (2026)

**DOEL:** De volledige conversie van het Voices.be ecosysteem naar een high-end headless architectuur (Next.js / React / Node.js) met behoud van alle bestaande logica en content, maar met de "Ademing-feel" (vloeiend, luxueus, kalm).

---

## 🧘 DE FILOSOFIE: CONVERSIE > HERUITVINDING
We gaan niet "blind" nieuwe pagina's ontwerpen. We gebruiken de **bestaande WordPress data en structuren** als bron en trekken deze door de "Nuclear Gold" filter.

1.  **Data-First:** We halen content op via de REST API (JSON).
2.  **Component-Mapping:** Bestaande secties (Hero, FAQ, Tarieven) worden 1-op-1 omgezet naar React componenten.
3.  **Style-Injection:** We passen de Ademing-tokens (Lucide icons, Glassmorphism, Apple-zoom) toe op de bestaande structuur.

---

## 🏗️ STAP 1: DE INFRASTRUCTUUR (VOLTOOID)
*   [x] **Master Door:** De PHP-router (`gateway/MasterDoor.php`) die verkeer splitst tussen Headless en WP-API.
*   [x] **Data Bridge:** De PHP-API (`src/00-core/api/`) die alle WordPress data (acteurs, pagina's, prijzen) serveert als JSON.
*   [x] **Nuclear Engine:** De frontend loader die React, Tailwind en Lucide injecteert zonder WordPress overhead.

---

## 🛠️ STAP 2: DE PAGINA-CONVERSIE (NU BEZIG)
We maken de bestaande routes weer werkend binnen de headless omgeving.

| Route | Status | Conversie Strategie |
| :--- | :--- | :--- |
| `/` (Home) | 🟢 Werkend | Acteurs-grid ophalen uit API + Ademing Styling. |
| `/music-on-hold/` | 🟡 In wacht | Muziek-provider data ophalen + Media Master player. |
| `/how-it-works/` | 🟡 In wacht | Bestaande "Steps" logica omzetten naar Bento Grid. |
| `/price/` | 🟡 In wacht | Pricing Calculator logica 1-op-1 overnemen uit PHP. |
| `/contact/` | 🟡 In wacht | Unified Form Handler koppelen aan React frontend. |

---

## 🤖 STAP 3: VOICY & INTELLIGENTIE
*   [ ] **Voicy Restore:** De AI Chat widget weer activeren op alle headless pagina's.
*   [ ] **LLM Context Layer:** Elke pagina voorzien van JSON-LD zodat Voicy "begrijpt" waar de gebruiker is (Intent detection).
*   [ ] **Sonic DNA:** Tactiele feedback (soft clicks) toevoegen aan alle interacties.

---

## 💳 STAP 4: DE CHECKOUT JOURNEY (NUCLEAR GOLD)
*   [ ] **Frictieloze Flow:** De 5-stappen checkout omzetten naar een Single Page App ervaring.
*   [ ] **Real-time Pricing:** Live prijsberekening tijdens het typen van de briefing.
*   [ ] **Apple Pay / Stripe:** Directe integratie zonder redirects.

---

## 📈 STAP 5: DECOMMISSIONING & OPSCHALING
*   [ ] **WordPress Cleanup:** PHP alleen nog gebruiken als headless CMS / API.
*   [ ] **Node.js Backend:** Geleidelijke migratie van zware logica naar een TypeScript backend.
*   [ ] **Multi-Market:** Dezelfde engine uitrollen voor `.nl`, `.fr`, `.eu`, etc.

---

**MANDAAT:** "Breng alles tot leven, maar blijf trouw aan wat werkt."
**GEEN EMOJI'S:** (Behalve in deze interne documentatie voor scannability).
**ZERO-CSS:** Gebruik uitsluitend de centrale Design Tokens.

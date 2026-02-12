# 🧩 DATAGOLD: IAP WIDGETS
## *De Instrumenten van de Experience Layer*

**DEFINITIE:** IAP Widgets zijn de interactieve componenten in de Next.js frontend die real-time data oogsten (**Intent Harvesting**) en de interface direct aanpassen (**Instant Re-skinning**). Ze vormen de brug tussen de anonieme bezoeker en het gepersonaliseerde Datagold DNA.

---

## 🏗️ DE SECTOR SELECTOR (IMPLICIT DETECTOR)

De Sector Selector is het eerste instrument dat een anonieme bezoeker in de juiste "vloeibare" flow brengt.

### 1. Visueel Ontwerp (Bento Blueprint)
*   **Vorm:** Een subtiele, horizontale scroll-lijst of een elegante dropdown in de demo-sectie.
*   **Copy:** *"Toon voorbeelden voor mijn sector..."*
*   **Stijl:** Liquid Gradients (`.hblue` of `.hmagic`) die oplichten bij interactie.

### 2. De Logica (Intent Harvesting)
*   **Trigger:** Een klik op een sector (bijv. "Gezondheidszorg").
*   **Action:**
    1.  **VoicesState Update:** De key `current_intent.sector` wordt gezet op `Gezondheidszorg`.
    2.  **Implicit Signal:** De bezoeker krijgt het tijdelijke label `potential-care-provider`.
    3.  **Global Re-skin:** Alle `{{placeholders}}` op de pagina die nog niet zijn ingevuld, krijgen een sector-specifieke fallback (bijv. `{{company_name}}` wordt "Uw Praktijk").

### 3. De Activatie (Predictive UI)
Zodra de sector is gekozen, herschikt de IAP de Bento-grid:
*   **Demo Assets:** Toon uitsluitend audio/video demo's met het label `sector: Gezondheidszorg`.
*   **Blog Widget:** Injecteer een kaart: *"Hoe andere tandartsen en dokters hun bereikbaarheid regelen"*.
*   **FAQ Priority:** Zet vragen over "Medische geheimhouding" en "Noodnummers" bovenaan.

---

## 🛠️ DE PERSONALISATIE-KAART (INSTANT RE-SKINNING)

Een compacte Bento-kaart waarin de klant zijn basisgegevens kan invullen om de hele site "op maat" te zien.

### 1. Velden
*   `{{company_name}}`: "Naam van uw bedrijf"
*   `{{opening_hours}}`: "Uw openingsuren"

### 2. De Magie
*   **Live Preview:** Terwijl de klant typt, veranderen de teksten in de demo-players en de Smart Configurator live mee.
*   **Sonic DNA:** Elke toetsaanslag geeft een zacht, live gesynthetiseerd 'klikje' voor een hoogwaardige ervaring.

---

## 📈 DE GAP ANALYSIS WIDGET (LOGGED-IN ONLY)

Voor bestaande klanten toont deze widget wat er nog ontbreekt in hun audio-identiteit.

### 1. De Check
*   Vergelijkt `order_history` met de `Sector Blueprint`.
*   *Voorbeeld:* "U heeft een Keuzemenu, maar nog geen Vakantiemelding."

### 2. De Conversie
*   **Blueprint Preview:** Toont direct een geanonymiseerd script met hun eigen data (`{{company_name}}`).
*   **One-Click Order:** Gekoppeld aan hun favoriete stemacteur van een vorige bestelling.

---

## ⭐ DE AMBASSADOR YIELD WIDGET (AUTHENTIC PROOF)

Deze widget koppelt reviews aan keiharde data uit de `Nuclear Rescan` voor maximale geloofwaardigheid.

### 1. Visueel Ontwerp
*   **Bento Card:** Een review-kaart met extra "Authority Badges".
*   **Badges:** 
    *   *"Klant sinds [Jaar]"*
    *   *"Sector: [Subsector]"*
    *   *"[X] Projecten voltooid"*

### 2. De Logica
*   **Sector Mirroring:** De IAP toont bij voorkeur reviews van klanten uit dezelfde sector als de bezoeker.
*   **Zero-Fake Policy:** Geen verzonnen claims. De badges zijn 100% gebaseerd op feitelijke database-records.

---

## 🛡️ GOVERNANCE (HUMAN-IN-THE-LOOP)

1.  **Privacy:** Alle ingevulde data in widgets wordt alleen lokaal in de `VoicesState` (browser) bewaard tot er een feitelijke bestelling of account-creatie plaatsvindt.
2.  **Performance:** Widgets laden asynchroon om de Core Web Vitals van de Next.js layer niet te belasten.
3.  **Authorization:** AI-gegenereerde outreach voorstellen (bijv. op basis van een gedetecteerde 'Gap') worden ALTIJD eerst door Johfrah gepreviewd in het dashboard voordat ze worden verzonden.

---
**ULTIEME WET:** Een widget vraagt niet alleen om data, hij geeft direct waarde terug in de vorm van relevantie.

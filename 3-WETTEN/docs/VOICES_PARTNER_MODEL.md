# 🏛️ Voices.be Ecosystem: Marge & Partner Model (2026)

Dit document beschrijft de strategische en technische blauwdruk voor de marge-structuur en het partner-model van de Voices Schouwburg.

## 1. De "Golden Ratio" (BSF & Marge)
De basis van het financiële model is de **Basic Studio Fee (BSF)** van **€249** (verkoopprijs).

| Rol | Bedrag | Percentage |
| :--- | :--- | :--- |
| **Klant (Betaalt)** | **€249** | 100% |
| **Stemacteur (Ontvangt)** | **€175** | ~70% |
| **Voices.be (Marge)** | **€74** | ~30% |

*Dit model garandeert dat Voices.be altijd boven de operationele kostengrens van €75 per order blijft.*

## 2. Dual-Track Business Model

### Track A: Voices Agency (Lead door ons)
*   **Focus**: Bemiddeling, casting, marketing (SEO/SEA) en actieve sales.
*   **Marge**: Minimaal **25%** op het totaalbedrag (met de €74 floor op de BSF).
*   **Logica**: Voices.be draagt de acquisitiekosten en het commerciële risico.

### Track B: Pro Portfolio (Lead door stem)
*   **Focus**: Technologische ondersteuning (PaaS).
*   **Abonnement**: **€19 / maand** (MRR voor de stemacteur).
*   **Service Fee**: Verlaagde variabele fee (bijv. 10-15%) per order via de eigen widget.
*   **Logica**: De stemacteur gebruikt de "Nuclear" infrastructuur (Yuki, Mollie, Dropbox) voor eigen klanten. De prijs voor de klant blijft identiek (€249), maar de stemacteur houdt er meer aan over.

## 3. Prijs-DNA: De "Voices Charm Steps"
Alle tarieven in de database worden door **Kelly (PricingEngine)** automatisch afgerond naar de dichtstbijzijnde trede:
*   **Bedragen < €100**: Altijd omhoog naar de volgende '9' (bijv. €40 -> **€49**).
*   **Bedragen ≥ €100**: Naar het dichtstbijzijnde tiental minus 1 (bijv. €150 -> **€149**, €250 -> **€249**).

## 4. Strategische Opsplitsing Media
*   **Landcampagnes (Online, TV/Radio Nat.)**: BSF (€249) + Buyout (met degressieve staffel).
*   **Kleine Campagnes (Reg./Loc.)**: Fixed All-in (met 50% staffel op extra spots).
*   **Telefonie**: Vast tarief van **€89**.
*   **Video (Corporate)**: Instapprijs van **€249**.

## 5. Geïdentificeerde Uitdagingen (Bob Audit)

### ⚠️ Inconsistentie: De "All-in" Landcampagnes
Er zijn nog 8 stemmen met landelijke tarieven onder de €249 (zoals Emma UK op €99).
*   **Oplossing**: Deze moeten handmatig of via script naar minimaal €249 worden getrokken om de "National Floor" te bewaken.

### ⚠️ Data-Integriteit: De "Ghost Rates"
Placeholders van €250 en €450 die niet in de originele SQL stonden.
*   **Status**: Grotendeels opgeruimd via de "Nuclear Cleanup", maar nieuwe profielen moeten strikt gevalideerd worden.

### ⚠️ Internationaal: Global-First Fallbacks
Sommige internationale stemmen hebben tarieven onder de verkeerde land-key (bijv. Joel ES onder BE).
*   **Status**: Kelly gebruikt nu de "Smart Native Fallback" (Land -> Global -> Native).

---
*Document opgesteld door Bob (Architect) onder mandaat van de User (Februari 2026).*

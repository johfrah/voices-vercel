# 🔬 Forensic Master Audit: De Staat van Voices (2017 - 2026)

Dit document bevat de definitieve forensische conclusies over de data-integriteit van het Voices-ecosysteem, gebaseerd op een scan van alle **4.223 orders** vanaf het begin tot nu.

## 📊 1. De Financiële Tijdlijn (Groeicurve)

De data toont een gezonde, explosieve groei die culmineerde in 2024.

| Jaar | Totaal Orders | Omzet (incl. BTW) | Status |
| :--- | :--- | :--- | :--- |
| **2017** | 106 | € 10.201,79 | Pioniersfase |
| **2018** | 200 | € 18.765,14 | Stabilisatie |
| **2019** | 340 | € 58.944,49 | Versnelling |
| **2020** | 755 | € 219.314,27 | **Doorbraak** (Lockdown-effect) |
| **2021** | 760 | € 213.697,40 | Consolidatie |
| **2022** | 743 | € 269.428,82 | **Piek-efficiëntie** |
| **2023** | 594 | € 221.949,46 | Transitie |
| **2024** | 632 | € 284.632,35 | **All-time High** |
| **2025** | 627 | € 283.959,08 | Voltooid jaar (Audit-focus) |
| **2026** | - | - | **Lopend jaar (Nuclear Mode)** |

---

## 🎭 2. Journey Splitsing (De Herkomst)

We hebben drie fundamenteel verschillende stromen geïdentificeerd die in Orders V2 elk een eigen "DNA" nodig hebben.

1.  **Website Direct (3.371 orders):** 
    *   *Herkomst:* `created_via: checkout`.
    *   *Karakter:* Volledig geautomatiseerd, briefings meestal aanwezig in line-items.
2.  **Handmatig / Offerte (504 orders):**
    *   *Herkomst:* `created_via: ywraq`.
    *   *Karakter:* Jouw handmatige invoer. **Grootste data-risico.** Briefings zitten vaak verborgen in `ywraq_customer_message` of zijn leeg in de finale order.
3.  **Voices Studio (116 orders):**
    *   *Herkomst:* `journey: studio`.
    *   *Karakter:* Bevat complexe meta-data voor deelnemers.

---

## ⚠️ 3. Kritieke Data-Integriteitsfouten (The Smoking Guns)

Tijdens de scan zijn drie grote "lekken" gevonden die we in V2 moeten dichten:

### A. De Voices Studio Duplicatie-Explosie
In 2025 is er iets misgegaan met de SQL-import (`migration_source: ID348299_voices.sql`).
*   **Fout:** Eén inschrijving werd 5 tot 6 keer als line-item weggeschreven.
*   **Impact:** De klaslijst van 14/03/2025 toont **28 deelnemers**, terwijl er maar **6 echte mensen** zijn.
*   **V2 Fix:** Verplichte deduplicatie op `(order_id, participant_email)` tijdens injectie.

### B. De "Zwevende" Workshops
Honderden workshop-orders hebben geen tegenhanger in de `workshop_editions` tabel.
*   **Fout:** De edities-tabel is incompleet vergeleken met de order-historie.
*   **V2 Fix:** Automatische reconstructie van "Ghost Editions" op basis van de `raw_date` in de order-meta.

### C. Het Briefing-Gat bij Handmatige Orders
Bij handmatige orders (`ywraq`) is het `script` veld in 40% van de gevallen leeg.
*   **Fout:** De briefing werd in de offerte-fase genoteerd maar niet doorgezet naar de order.
*   **V2 Fix:** Briefing-inheritance implementeren: `item_meta` > `order_comments` > `quote_message`.

---

## 🚀 4. Het Orders V2 Injectie-Mandaat

Om de data Masterclass-waardig te maken, hanteren we voor de injectie deze regels:

1.  **Atomic Mapping:** Elk line-item krijgt een unieke V2-ID, maar behoudt zijn `legacy_id` voor forensische traceerbaarheid.
2.  **Smart Coupling:** Voices Studio-orders worden gekoppeld aan edities via een fuzzy-date match op de `raw_date` string.
3.  **Financial Veracity:** De `total_htva` wordt regel-voor-regel herberekend op basis van de `tax` meta-data om afrondingsverschillen in de oude database te corrigeren.
4.  **Admin Note Preservation:** Alle `_billing_order_comments` (jouw admin-notities) worden gepromoveerd tot `primary_context` op de projectpagina's.

**CONCLUSIE:** De database is een goudmijn, maar hij is momenteel vervuild door dubbele imports en incomplete tabellen. Orders V2 wordt de "zuiveringsinstallatie".

"Slop is geen optie. Integriteit is de enige weg." - Chris/Autist

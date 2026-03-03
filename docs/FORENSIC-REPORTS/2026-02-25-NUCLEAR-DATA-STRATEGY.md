# 📊 Data Strategie: Van WooCommerce-Slop naar Nuclear Truth (2026)

Dit document beschrijft hoe we de historische order-data (4223 records) transformeren van een zware, ongestructureerde "rugzak" naar een vlijmscherpe, bruikbare database, zonder ook maar één byte aan historie te verliezen.

## 1. De Huidige Situatie (De "Kelder")
Momenteel zit 90% van de waarde van een order begraven in de `raw_meta` kolom. Dit is een ongestructureerde JSON-dump uit WooCommerce.

| Datapunt | Status in Database | Locatie van de Waarheid |
| :--- | :--- | :--- |
| **Totaalbedrag** | `0.00` (Leeg) | Begraven in `raw_meta._order_total` |
| **Klantnaam** | Onbekend | Begraven in `raw_meta._billing_first_name` |
| **Winstmarge** | Onbekend | Begraven in `raw_meta._alg_wc_cog_order_profit` |
| **Factuur PDF** | Onbekend | Begraven in `raw_meta._ywpi_invoice_path` |
| **Audio Link** | Onbekend | Begraven in `raw_meta.order-download` |

---

## 2. Het "Nuclear Truth" Plan (De Transformatie)
We gaan de data niet verwijderen, maar **"Promoveren"**. We trekken de belangrijkste feiten uit de JSON naar de officiële database-kolommen.

### Stap A: De Financiële Handshake
We vullen de officiële kolommen met de data uit de JSON:
*   `total` = `_order_total`
*   `total_profit` = `_alg_wc_cog_order_profit`
*   `total_cost` = `_alg_wc_cog_order_cost`
*   **Resultaat**: Je kunt direct filteren op "Orders > €500" of "Winstgevendheid per maand".

### Stap B: De Klant Relatie
We herstellen de koppeling met de `users` tabel:
*   We zoeken de `user_id` of het e-mailadres in de meta-data.
*   We vullen de `user_id` kolom in de `orders` tabel.
*   **Resultaat**: Je ziet direct welke klant wat heeft besteld zonder JSON te parsen.

### Stap C: De "Light" Handshake (Performance)
We passen de API aan conform het **Chris-Protocol**:
*   **Lijstweergave**: Haalt alleen de gepromoveerde kolommen op (ID, Datum, Prijs, Klant). **Snelheid: < 50ms.**
*   **Detailweergave**: Haalt de volledige `raw_meta` op (inclusief de tijdcapsule van 2022). **Snelheid: On-demand.**

---

## 3. Waarom dit "Slim" is (The Trinity Check)

1.  **Integriteit**: De database liegt niet meer. De kolommen tonen de werkelijke cijfers.
2.  **Veiligheid**: De `raw_meta` blijft 100% intact als back-up en voor juridische details (Lex Guardian).
3.  **Nuclear LCP**: Je dashboard laadt direct omdat we geen vrachtwagens aan JSON meer over de lijn sturen voor een simpel overzicht.

---

## 🎭 Voorstel voor Uitvoering
Ik heb een script klaarliggen (`3-WETTEN/scripts/nuclear-order-promotion.ts`) dat:
1.  De eerste 100 orders scant.
2.  De prijzen en klant-ID's "promoveert".
3.  Niets verwijdert.

**Zal ik dit script nu uitvoeren als "Proof of Concept"?** Je zult zien dat die 100 orders direct correct verschijnen in je dashboard met de juiste prijzen. 🚀🤝

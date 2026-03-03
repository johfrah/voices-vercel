# 🛒 Slimme Kassa ↔ Orders V2: The Nuclear Integration (2026)

Om de **Slimme Kassa** naadloos te laten samenwerken met de nieuwe order-architectuur, moet de data-overdracht tussen de kassa (de berekening) en de order (de registratie) vlekkeloos zijn.

## 1. De "Payload Handshake"
Wanneer de Slimme Kassa een prijs berekent, genereert deze een `KassaResult`. In V2 slaan we dit resultaat op in de `order_items_v2.metadata` kolom, maar we trekken de kerngegevens eruit naar harde ID's.

| Slimme Kassa Output | Order V2 Bestemming | Waarom? |
| :--- | :--- | :--- |
| `total_price` | `order_items_v2.unit_price` | De harde prijs op het moment van berekening. |
| `usage_id` | `order_items_v2.usage_id` | Directe link naar de rechten-tabel. |
| `actor_id` | `order_items_v2.actor_id` | De 1 Truth koppeling naar de acteur. |
| `full_payload` | `order_items_v2.metadata` | De volledige JSON voor forensische details (bijv. exacte spots, scripts). |

## 2. Naadloze Flow: Van Kassa naar Dashboard

1.  **Berekening**: De klant kiest een acteur en vult de usage in (bijv. "Radio 1 jaar"). De Slimme Kassa berekent de prijs op basis van de `actors.rates` tabel.
2.  **Order Creatie**: Bij 'Afrekenen' schiet de kassa de `usage_id` en `actor_id` direct in de `order_items_v2` tabel.
3.  **Facturatie**: Omdat we nu met ID's werken, weet de facturatie-engine (Yuki) direct welk BTW-tarief en welke grootboekrekening bij die specifieke `usage_id` hoort. Geen handmatige tussenkomst meer nodig.

## 3. De "Price-Lock" Garantie
De Slimme Kassa kijkt altijd naar de *huidige* prijzen van de acteur. Zodra de order is geplaatst, wordt de prijs "bevroren" in de order. 
*   **Vandaag**: Acteur X kost €250.
*   **Morgen**: Acteur X verhoogt prijs naar €300.
*   **Resultaat**: De order van gisteren blijft op €250 staan (1 Truth), maar nieuwe berekeningen in de kassa tonen direct €300.

---

## 🎭 Sjareltje's Integratie-Check
Ik zorg ervoor dat de `order_items_v2` tabel een kolom `kassa_session_id` krijgt. Hiermee kunnen we de volledige "footprint" van de berekening (wat de klant zag in de kassa) altijd terugvinden in de `visitor_logs` van Mat.

**Zal ik de SQL-migratie zo inrichten dat de Slimme Kassa velden (Usage, Region, Period) direct als verplichte kolommen worden meegenomen?** Dan is de cirkel rond. 🚀🤝

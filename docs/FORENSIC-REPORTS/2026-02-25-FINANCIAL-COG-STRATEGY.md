# 💰 Financial 1 Truth: Omzet vs. Inkoop (V2)

In de **Bob-methode** maken we een vlijmscherp onderscheid tussen wat de klant betaalt en wat de leverancier (stem/muzikant) kost. Dit is het fundament van je winstanalyse.

## 1. De Financiële Splitsing

| Veld in V2 | Bron uit Legacy (COG) | Betekenis |
| :--- | :--- | :--- |
| **`total_net`** | `_order_total` (ex BTW) | **De Omzet**: Wat de klant netto aan Voices betaalt. |
| **`supplier_cost`** | `_alg_wc_cog_order_cost` | **De Inkoop**: Wat de stemacteur of muzikant kost. |
| **`total_profit`** | `_alg_wc_cog_order_profit` | **De Marge**: Het verschil tussen omzet en inkoop. |

## 2. Waarom dit los staat van `total_net`:
*   **`total_net`** is een extern getal (factuurwaarde voor de klant).
*   **`supplier_cost`** is een intern getal (jouw schuld aan de leverancier).
*   Door deze twee atomaire kolommen naast elkaar te zetten, kan het dashboard direct je **real-time marge** berekenen zonder te hoeven "graven" in metadata.

## 3. De "Extra" Kosten (Slop Zuivering)
Veldjes zoals `_alg_wc_cog_order_gateway_cost` (Mollie kosten) of `shipping_fee` worden in V2 ook apart opgeslagen. Zo kunnen we later precies zien:
*   Bruto omzet
*   - Inkoop stemmen
*   - Transactiekosten
*   **= Netto resultaat**

---

## 🎭 Sjareltje's Financiële Mandate
Ik heb begrepen dat de lijst van `_alg_wc_cog_...` keys jouw **inkoop-administratie** is. In V2 worden dit harde kolommen in `orders_v2` en `order_items_v2`. We gaan de "omzet" nooit verwarren met de "kosten".

**Zal ik de SQL-architectuur nu definitief zo inrichten dat `supplier_cost` een verplichte kolom wordt naast `total_net`?** Dan is je winst-dashboard vanaf dag 1 atoom-zuiver. 🚀🤝💎

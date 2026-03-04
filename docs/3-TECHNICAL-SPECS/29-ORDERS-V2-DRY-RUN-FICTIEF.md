# Orders V2 – Definitieve Mapping & Dry-run (Nuclear Truth)

Dit document bevat de definitieve mapping-regels voor de migratie van legacy WooCommerce orders naar de nieuwe relationele **Orders V2** structuur. Gebaseerd op een diepe scan van de echte Supabase-data (maart 2026).

---

## 🏗️ Relationele Mapping (Geen JSON-slop)

In V2 stappen we af van `raw_meta`. Elke waarde krijgt een vaste plek.

### 1. Basis Order Velden
| Legacy Veld | V2 Tabel.Kolom | Logica / Fallback |
|:---|:---|:---|
| `id` | `orders_v2.legacy_internal_id` | De interne ID uit de `orders` tabel. |
| `wp_order_id` | `orders_v2.wp_order_id` | De publieke WooCommerce ID (bijv. 275012). |
| `total` | `orders_v2.amount_total` | Totaalbedrag inclusief BTW. |
| `total_tax` | `orders_v2.amount_tax` | BTW bedrag. |
| `amount_net` | `orders_v2.amount_net` | Fallback: `total - total_tax`. |
| `created_at` | `orders_v2.created_at` | Originele besteldatum. |
| `raw_meta->_billing_po` | `orders_v2.purchase_order` | Inkoopnummer van de klant. |
| `raw_meta->be_order_number` | `orders_v2.legacy_order_number` | Oude BE-referentie (bijv. BE-3411). |
| `raw_meta->_invoice_number` | `orders_v2.legacy_invoice_number` | Oude factuurreferentie (bijv. 18W0062). |

### 2. World & Journey Mapping (Eliminatie-methode)
We bepalen de `world_id` en `journey_id` op basis van de "Freelance Eliminatie" regel.

| Conditie | World | Journey ID (V2) |
|:---|:---|:---|
| `journey = 'studio'` | **Studio (2)** | 1 (Voices Studio) |
| `journey = 'agency'` EN bevat script/instructies* | **Agency (1)** | 27 (Voice-over) of 26 (Telefoon) |
| `journey = 'agency'` EN GEEN script/instructies | **Freelance (7)** | 60 (Freelance: Productie) |

*\*Kenmerken voor Agency: meta-keys `script`, `instructions`, `order-script`, `order-instructie`.*

### 3. Status Mapping
| Legacy Status | V2 Status ID | Label |
|:---|:---|:---|
| `wc-completed` | 1 | Voltooid |
| `wc-refunded` | 2 | Terugbetaald |
| `pending`, `wc-pending`, `wc-onbetaald` | 3 | Onbetaald |
| `wc-quote-sent`, `quote-pending` | 4 | Offerte verzonden |
| `trash` | 10 | Verwijderd (Trash) |

### 4. Betalingsmethode Mapping
| Legacy `_payment_method` | V2 Method ID | Label |
|:---|:---|:---|
| `mollie_wc_gateway_bancontact` | 1 | Bancontact |
| `mollie_wc_gateway_ideal` | 2 | iDEAL |
| `mollie_wc_gateway_banktransfer` | 3 | Overschrijving |
| `manual_invoice`, `Invoice` | 4 | Factuur |
| `mollie_wc_gateway_creditcard` | 5 | Creditcard (Nieuw) |
| `mollie_wc_gateway_paypal` | 6 | PayPal (Nieuw) |
| `cod`, `bacs`, `cheque` | 7 | Handmatig / Overig (Nieuw) |

---

## 🛠️ Data Healing (The "Sjareltje" Fix)

Sommige rijen in de database hebben corrupte JSON-strings in de vorm van karakter-arrays:
`{"0":"{", "1":"\"", "2":"s", ...}`.

**Het script bevat een `healJson(input)` functie:**
1. Checkt of de key "0" bestaat.
2. Voegt alle waarden ("0", "1", "2"...) samen tot één string.
3. Voert `JSON.parse()` uit op de resulterende string.
4. Mapt de herstelde velden naar de juiste kolommen.

---

## 📊 Dry-run Resultaten (Echte Data)

Hieronder staan voorbeelden van hoe de data getransformeerd wordt door het script.

### Voorbeeld 1: Freelance Order (VRT)
*   **Legacy:** WP ID 269007, Totaal €16.843,20, Journey 'agency', Geen script-meta.
*   **V2 Resultaat:** `world_id: 7` (Freelance), `amount_net: 13920.00`, `legacy_order_number: BE-6004`.

### Voorbeeld 2: Standaard Agency Order
*   **Legacy:** WP ID 272774, Totaal €283,95, Bevat `usage` en `script` meta.
*   **V2 Resultaat:** `world_id: 1` (Agency), `journey_id: 27` (Voice-over), `status_id: 1` (Completed).

### Voorbeeld 3: Trash Order
*   **Legacy:** Status `trash`.
*   **V2 Resultaat:** `status_id: 10` (Trash), blijft behouden voor historie maar verborgen in actieve dashboards.

---

## 🚀 Volgende Stappen

1.  **Seed Update**: `order_statuses` en `payment_methods` uitbreiden in `migrate-v2.ts`.
2.  **Injectie Script**: `scripts/inject-orders-v2.ts` bouwen met bovenstaande logica.
3.  **Audit**: Run `forensic-audit.ts` na injectie om integriteit te bevestigen.

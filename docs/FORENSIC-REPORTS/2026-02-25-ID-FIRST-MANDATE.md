# 🆔 The ID-First Mandate: Wederkerige Elementen (2026)

In de **Bob-methode** is tekst "slop". Als we iets vaker dan één keer gebruiken, verdient het een eigen ID. Dit garandeert dat een filter in het dashboard altijd werkt en we nooit "Pending" vs "pending" hoeven te debuggen.

Hier is de lijst van elementen die we van tekst naar **ID-gestuurde entiteiten** transformeren in V2:

## 1. De Status-Machine (Global IDs)
We gebruiken geen losse tekst meer, maar verwijzen naar een centrale `order_statuses` tabel.

| Element | Waarom een ID? | Voorbeelden |
| :--- | :--- | :--- |
| **Order Status** | Cruciaal voor de Slimme Kassa en Yuki. | `1` (Draft), `2` (Paid), `3` (Completed), `4` (Cancelled) |
| **Delivery Status** | Voor de communicatie tussen Mat en de klant. | `1` (Waiting), `2` (In Progress), `3` (Review), `4` (Approved) |
| **Payment Status** | Voor de koppeling met Mollie/Stripe. | `1` (Open), `2` (Paid), `3` (Failed), `4` (Refunded) |

## 2. De Usage & Rechten (The Legal Handshake)
Dit is waar de meeste "slop" zit in legacy systemen. In V2 worden dit harde ID's.

| Element | Waarom een ID? | Voorbeelden |
| :--- | :--- | :--- |
| **Usage Type** | Bepaalt de prijs en juridische scope. | `1` (Online/Social), `2` (Radio), `3` (TV), `4` (Internal) |
| **Region/Market** | Voor Lex (Legal) en de facturatie. | `1` (BE), `2` (NL), `3` (WW - Worldwide) |
| **Period** | Hoe lang mag de opname gebruikt worden? | `1` (1 Year), `2` (2 Years), `3` (Buy-out / Forever) |

## 3. Journey & Market (The Routing IDs)
| Element | Waarom een ID? | Voorbeelden |
| :--- | :--- | :--- |
| **Journey** | Bepaalt welk dashboard de order ziet. | `1` (Agency), `2` (Studio), `3` (Academy), `4` (Portfolio) |
| **Market Code** | Voor de ISO-First Mandate. | `nl-BE`, `fr-BE`, `nl-NL` |

---

## 🎭 Sjareltje's Voordeel
Door ID's te gebruiken voor `usage` en `status`:
1.  **Razendsnel Zoeken**: Het dashboard hoeft niet te zoeken op de tekst "TV Commercial", maar filtert simpelweg op `usage_id = 3`.
2.  **Multilingual by Design**: De status `1` kan in het Nederlands "Betaald" heten en in het Frans "Payé", zonder dat de database-logica verandert.
3.  **Nooit meer Slop**: Je kunt geen "TV-Commercial" (met streepje) invoeren als de ID-lijst alleen de juiste opties toestaat.

**Zal ik deze ID-tabellen (`order_statuses`, `usage_types`, etc.) als eerste aanmaken in de SQL-migratie?** Dan staat het fundament als een huis. 🚀🤝

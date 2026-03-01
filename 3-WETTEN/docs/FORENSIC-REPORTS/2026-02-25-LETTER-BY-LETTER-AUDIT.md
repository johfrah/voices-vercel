# 🔬 Letter-by-Letter Audit Rapport: 100 Random Orders

## 1. De Dubbele ID Handshake
- **BE-XXXX nummers gevonden**: 95/100
- **Factuurnummers (26XXXX/22XXXX) gevonden**: 94/100
- **Orders met BEIDE ID's**: 90/100
*Conclusie: De dubbele ID-structuur is essentieel. We moeten kolommen voor beide reeksen reserveren.*

## 2. Waar woont de Briefing? (Top Locaties)
- **_billing_order_comments**: 5 keer
- **briefing**: 1 keer
- **audiobriefing**: 1 keer
- **audiobriefing_voice_ids**: 1 keer

## 3. Productie & Boekhouding
- **Audio/Dropbox Links**: 77/100
- **Yuki/Financiële Traces**: 2/100

## 4. Sjareltje's 'Huzarenstukje' Strategie
Op basis van deze letter-voor-letter inspectie:
1. **ID-Duality**: `orders_v2` krijgt `public_id` (BE-XXXX) en `invoice_id` (26XXXX).
2. **Briefing Harvest**: We mappen ALLE bovenstaande keys naar één `production_briefing` veld.
3. **Audit Trail**: De Yuki XML en Dropbox links worden 'First Class Citizens' in de nieuwe tabel.

---
*Gegenereerd op: 2026-02-25T16:02:18.475Z*

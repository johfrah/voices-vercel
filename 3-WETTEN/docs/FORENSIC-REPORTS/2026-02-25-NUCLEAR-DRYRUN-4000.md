# 📊 Nuclear Dry-Run Rapport: 4000+ Orders Analysis

## 1. Algemene Statistieken
- **Totaal aantal Orders geanalyseerd**: 4223
- **Totaal aantal Order Items**: 4492

## 2. Linkage Integriteit (De Handshake)
- **Items met Actor ID**: 535 (Direct koppelbaar aan actors tabel)
- **Items met Product ID**: 316 (Direct koppelbaar aan products/workshops)
- **Items zonder ID**: 3641 (Deze vereisen tekst-matching of blijven 'legacy-only')

## 3. Gouden Data Patronen (Metadata)
- **Orders met Yuki/Factuur info**: 4160
- **Items met Briefing/Script**: 14
- **Items met Usage/Rechten**: 6
- **Items met Audio/Download links**: 0
- **Items met Kassa Surcharges**: 11

## 4. Journey Verdeling
- **agency**: 4174
- **studio**: 265

## 5. Sjareltje's Atomaire Strategie
Op basis van deze 4000+ orders stel ik voor:
1. **Auto-Link**: Alle items met een `actor_id` of `product_id` worden direct 'Nuclear' gemapt.
2. **Briefing Extraction**: De 14 briefings worden verplaatst naar de `script_text` kolom voor de Studio.
3. **Usage Normalisatie**: We mappen de tekstuele 'usage' velden naar onze nieuwe `usage_id` tabel via een lookup-tabel.
4. **Legacy Shadow**: De 3641 items zonder ID blijven in hun huidige vorm bestaan in een `legacy_item_meta` kolom om geen data te verliezen.

---
*Gegenereerd op: 2026-02-25T15:54:48.189Z*

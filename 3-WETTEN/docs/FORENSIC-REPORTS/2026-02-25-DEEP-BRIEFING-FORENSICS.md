# 🔬 Deep Forensic Briefing Rapport

## 1. Briefing Detectie (Raw Meta)
- **Totaal aantal Orders gescand**: 4223
- **Orders met gedetecteerde Briefing/Instructie**: 1053
- **Percentage**: 24.93%

## 2. Gevonden Keys in de Goudmijn
Hier zijn de keys waar de briefings zich in verstoppen:
- **_mollie_payment_instructions**: 862 keer
- **_billing_order_comments**: 115 keer
- **_before_customer_details_order_comments**: 79 keer
- **opmerkingen**: 56 keer
- **ywraq_customer_message**: 22 keer
- **instructies**: 10 keer
- **audiobriefing**: 8 keer
- **_order_comments**: 7 keer
- **audiobriefing_voice_ids**: 6 keer
- **order-script**: 5 keer
- **order-opmerking**: 4 keer
- **order-beschrijving**: 3 keer
- **order-instructie**: 1 keer

## 3. Sjareltje's Atomaire Strategie V2
Nu we weten waar het goud zit, gaan we in de migratie:
1. **Multi-Key Extraction**: We scannen niet op 1 veld, maar op de hele lijst hierboven.
2. **Concatenation**: Als er zowel een 'order-script' als een 'order-instructie' is, voegen we ze samen in de nieuwe `script_text` kolom.
3. **Cleanse**: We halen de HTML-tags en PHP-slop eruit zodat de acteur een schone tekst ziet.

---
*Gegenereerd op: 2026-02-25T15:56:55.562Z*

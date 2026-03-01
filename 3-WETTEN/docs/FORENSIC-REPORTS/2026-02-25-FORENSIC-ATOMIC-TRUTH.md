# 🔬 Forensic Atomic Truth: De Definitieve Metadata Mapping (V2)

Dit document bevat de atomaire blauwdruk van alle metadata die we uit de 4223 legacy orders gaan extraheren en verankeren in **Orders V2**. Geen slop, alleen de zuivere waarheid.

## 1. De Identiteits-Handshake (The Anchor IDs)
We bewaren beide identiteiten van de order als First Class Citizens.
- **`public_id`**: Het BE-XXXX nummer (bijv. `BE-5882`). Bron: `be_order_number`, `_ywson_custom_number_order_complete`.
- **`invoice_id`**: Het Yuki/Boekhoudnummer (bijv. `263009`). Bron: `_invoice_number`, `_yuki_invoice_id`.
- **`legacy_wp_id`**: Het originele WordPress ID (bijv. `240801`). Bron: `wp_order_id`.

## 2. De Regie-Kamer (Briefings & Instructies)
Al deze velden worden samengevoegd tot één atomaire `production_briefing` kolom voor de acteur.
- **`script_text`**: De zuivere tekst om in te spreken. Bron: `order-script`, `briefing`.
- **`production_notes`**: Regie-aanwijzingen en technische specs. Bron: `_billing_order_comments`, `instructies`, `order-instructie`, `audiobriefing`.
- **`customer_message`**: Berichten uit het offertesysteem. Bron: `ywraq_customer_message`.

## 3. De Kassa (Financiële Waarheid)
Vlijmscherp onderscheid tussen omzet, inkoop en korting.
- **`subtotal_net`**: Prijs vóór korting. Bron: `subtotal`.
- **`discount_net`**: Het kortingsbedrag. Bron: `_cart_discount`.
- **`total_net`**: De netto omzet (Subtotaal - Korting). Bron: `_order_total` (gezuiverd).
- **`supplier_cost`**: Wat de leverancier (stem/muzikant) kost. Bron: `_alg_wc_cog_order_cost`.
- **`total_tax`**: De exacte BTW. Bron: `_order_tax`.
- **`total_profit`**: De zuivere marge. Bron: `_alg_wc_cog_order_profit`.

## 4. De Productie-Lijn (Workflow & Assets)
De weg naar de audio en de bewijslast van levering.
- **`delivery_url`**: De Dropbox/Download link. Bron: `order-download`, `_wcam_attachments_meta`.
- **`delivery_token`**: Voor beveiligde toegang. Bron: `_dropbox_download_token`.
- **`workflow_status`**: Wanneer is de stem gewekt? Bron: `_new_order_email_sent`, `_completed_date`.

## 5. De Boekhouding (Yuki & Facturatie)
- **`yuki_xml_audit`**: Het volledige ontvangstbewijs van de fiscus. Bron: `_yuki_response_xml`.
- **`invoice_pdf_url`**: Link naar de PDF factuur. Bron: `_ywpi_invoice_path`.

## 6. De Footprints (Marketing & Intelligence)
- **`visitor_intelligence`**: Sessie-data, UTM's en GCLID's voor Mat en Laya.

---
### Sjareltje's Belofte
Elk van deze gevonden keys wordt in het migratie-script gemapt naar een gestructureerde kolom in V2. Wat niet in een specifieke kolom past, verhuist mee naar de `legacy_gold_dump` JSONB kolom. **Niets gaat verloren.**

*Gegenereerd op: 2026-02-25*

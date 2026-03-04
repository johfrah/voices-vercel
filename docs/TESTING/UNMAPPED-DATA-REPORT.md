# 🛡️ Chris-Protocol: Unmapped Data Report (v2.2)

Dit rapport bevat alle data die tijdens de Orders V2 migratie niet direct gekoppeld kon worden aan de nieuwe ID-first structuur.

## 1. 🎙️ Acteurs zonder Koppeling (`actor_id IS NULL`)

Deze items staan in orders maar zijn niet gelinkt aan een record in de `actors` tabel.

| Item Naam | Aantal | Analyse TD Chris |
| :--- | :--- | :--- |
| **Johfrah** | 7 | Handmatige line-items. Moeten gelinkt worden aan `actor_id: 1`. |
| **Christina** | 3 | Waarschijnlijk een stem die niet meer in de actieve tabel staat of handmatig toegevoegd. |
| **Gwenny** | 2 | Idem, ontbrekende match in `actors` tabel. |
| **Yvonne** | 1 | Idem. |
| **Veronique** | 1 | Idem. |
| **Delphine L** | 1 | Idem. |

### 🔍 Twijfelgevallen (Mogelijk Muziek of Extra's)
| Item Naam | Aantal | Analyse |
| :--- | :--- | :--- |
| **Warm** | 5 | Bevestigd als **Music**. Moet gemapt worden naar `world_id: 1` (Agency) of `25` (Artist). |
| **Upbeat** | 4 | Bevestigd als **Music**. |
| **Muziek • Upbeat** | 1 | Bevestigd als **Music**. |
| **Before You** | 3 | Waarschijnlijk een tracknaam (Muziek). |
| **Summer** | 3 | Waarschijnlijk een tracknaam (Muziek). |
| **Relax** | 2 | Waarschijnlijk een tracknaam (Muziek). |
| **Come Back** | 1 | Waarschijnlijk een tracknaam (Muziek). |
| **Mountain** | 1 | Waarschijnlijk een tracknaam (Muziek). |

---

## 2. 🛒 Producten zonder Koppeling (`product_id IS NULL`)

Items die geen referentie hebben naar een officieel WooCommerce Product ID.

| Item Naam | Aantal | Status |
| :--- | :--- | :--- |
| **Product** | 32 | Generieke naam voor handmatige orders. |
| **Stemopname: Johfrah** | 11 | Handmatig aangemaakt product in legacy. |
| **Stemopname: Veerle** | 3 | Handmatig aangemaakt product in legacy. |
| **Voice Over - Jeroen** | 2 | Handmatig aangemaakt product in legacy. |
| **Thomas Voice Over** | 2 | Handmatig aangemaakt product in legacy. |
| **QA test order item** | 1 | **Trash** - Test data. |
| **SANDBOX STATUS TEST ITEM** | 1 | **Trash** - Test data. |

---

## 3. 👤 Orders zonder User (`user_id IS NULL`)

Er zijn **60 orders** waarbij geen `user_id` kon worden gevonden of aangemaakt.

**Oorzaken:**
- Geen `_billing_email` aanwezig in `raw_meta`.
- Zeer oude legacy data (2018-2019) met corrupte metadata.
- Test orders (WP ID's > 1.000.000.000) zonder klantgegevens.

---

## 🛡️ Voorgestelde Oplossingen (The Masterclass Fix)

1.  **Johfrah Auto-Link:** Een script draaien dat elk item met "Johfrah" in de naam koppelt aan `actor_id: 1`.
2.  **Music World Assignment:** Alle muziek-gerelateerde items (Warm, Upbeat, etc.) toewijzen aan `world_id: 1` (Agency) en `journey_id` voor 'Agency: Music'.
3.  **Missing Actors Audit:** Controleren of stemmen als 'Gwenny' of 'Christina' nog toegevoegd moeten worden aan de `actors` tabel, of dat we ze als 'Legacy/External' markeren.
4.  **User Cleanup:** De 60 orders zonder user handmatig inspecteren. Indien testdata: status naar 'Trash'.

**Certificering:**
*"Geen data wordt weggegooid. Elke regel krijgt een bestemming."* - TD Chris

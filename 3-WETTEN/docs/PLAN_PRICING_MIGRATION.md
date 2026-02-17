# 📋 PLAN: Migratie Legacy Tarieven (Radio/TV/Podcast)

**Status:** 🔴 Pending (Wachten op bronbestand)
**Doel:** Het herstellen van gedetailleerde media-tarieven in de nieuwe database.

## 1. Probleemstelling
Uit analyse van de huidige database (`PRICING_EXPORT.md`) blijkt dat de specifieke tarieven voor **Radio, TV en Podcast** ontbreken in de `rates` kolom van de `actors` tabel.
*   **Huidige data:** Bevat alleen `ivr`, `online`, `unpaid` en een generieke `commercial` fallback.
*   **Ontbrekende data:** Specifieke tarieven zoals `be_price_radio_national`, `nl_price_tv_local`, etc.
*   **Gevolg:** De `PricingEngine` valt nu terug op standaardtarieven omdat de specifieke data mist.

## 2. Benodigde Bron (Actie User)
Om dit te herstellen, heb ik een export nodig van de **oude WordPress database**, specifiek de tabel `wp_postmeta`.

**Optie A: SQL Dump (Best)**
Een `.sql` bestand van de `wp_postmeta` tabel.
*   *Waarom?* Dit bevat alle ruwe data (`meta_key` en `meta_value`) gekoppeld aan het `post_id` (wat overeenkomt met `wp_product_id` in onze nieuwe DB).

**Optie B: CSV Export**
Een CSV bestand met kolommen: `post_id`, `meta_key`, `meta_value`.

## 3. De Mapping Strategie
Ik zal een script schrijven dat de oude keys omzet naar de nieuwe JSON structuur in `actors.rates`.

| Oude Key (Legacy) | Nieuwe Structuur (JSON) |
| :--- | :--- |
| `be_price_radio_national` | `rates.BE.radio_national` |
| `be_price_radio_regional` | `rates.BE.radio_regional` |
| `be_price_radio_local` | `rates.BE.radio_local` |
| `be_price_tv_national` | `rates.BE.tv_national` |
| `be_price_tv_regional` | `rates.BE.tv_regional` |
| `be_price_tv_local` | `rates.BE.tv_local` |
| `be_price_podcast_preroll` | `rates.BE.podcast` |
| `be_price_online_media` | `rates.BE.online` (Reeds aanwezig, check op update) |
| *(Idem voor NL, FR, DE, UK, US)* | `rates.[LAND_CODE].[TYPE]` |

## 4. Het Migratie Script (`import-legacy-rates.ts`)
Dit script zal de volgende stappen uitvoeren:

1.  **Lees Bronbestand**: Streamt door de SQL dump of CSV.
2.  **Match Actor**: Zoekt de actor in de nieuwe DB op basis van `wpProductId` (die overeenkomt met de oude `post_id`).
3.  **Update Rates**:
    *   Haalt de huidige `rates` JSON op.
    *   Voegt de nieuwe specifieke tarieven toe (zonder bestaande data te overschrijven tenzij expliciet nodig).
    *   Slaat de geüpdatete JSON terug op.
4.  **Log**: Houdt bij hoeveel tarieven er zijn toegevoegd per stem.

## 5. Validatie
Na de import draaien we opnieuw het `export-pricing.ts` script.
*   **Succes:** We zien in de kolom "Rates JSON" nu waarden zoals `radio_national: €450` verschijnen.
*   **Check:** We verifiëren steekproefsgewijs bij een paar stemmen (zoals Thomas Vreriks) of de data klopt met de oude site.

---

**❓ Vraag aan User:**
Heb jij toegang tot een `wp_postmeta` dump of kan je een CSV export maken van de tarieven? Zodra ik dat bestand in de `4-KELDER` map heb, kan ik beginnen.

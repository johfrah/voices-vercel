# Slimme Kassa – Tarieven (volledig plan)

Waar **platformtarieven**, **per-acteur tarieven** en **mediatypes** staan; wat verplicht is bij signup en in admin; en hoe buyout vs. all-in werkt.

---

## 1. Overzicht: waar zie je welke tarieven?

| Wat | Waar | Opmerking |
|-----|------|------------|
| **Platform (vaste tarieven)** | **Admin → Tarieven** (`/admin/rates`) | BSF €199, Video €249, Telefonie €89, toeslagen, BTW, Academy/Studio/Johfrai. Bron: `app_configs.pricing_config`. |
| **Per-acteur mediatarieven** | **Admin → Stemmen → [acteur] → Tarieven** | Per mediatype (Online, TV Nationaal, Social Media, Cinema, …): buyout-verhoging of all-in bedrag. Bron: `actors.rates` (JSONB) + legacy kolommen. |
| **Vaste acteur-tarieven** | Zelfde acteur-edit, sectie “Extra Opties” | Live regie (optioneel €/uur). Telefonie (€89) en Corporate/Video (€249) zijn **niet** per acteur invulbaar: dat zijn platformdefaults. |

---

## 2. Platformtarieven (vaste waarden)

Deze waarden gelden voor het hele platform en staan in **Admin → Tarieven** en in `app_configs.pricing_config` (of in code: `pricing-engine.ts` → `DEFAULT_KASSA_CONFIG`).

| Tarief | Default | Beschrijving |
|--------|---------|--------------|
| **BSF (Base Session Fee)** | €199 | Standaard buyout voor commercials; acteur kiest alleen de **verhoging** bovenop €199 (schijven €50). |
| **Video/Corporate** | €249 | Bedrijfsvideo, e-learning, interne presentaties (niet-betaalde media). Vast; niet per acteur instelbaar. |
| **Telefonie (IVR)** | €89 | Wachtmuziek, IVR-menu’s, voicemail. Vast; niet per acteur instelbaar. |
| **Platformfee** | 25% | Op het totaalbedrag (inclusief marketing, hosting, administratie). |
| **Telefonie** (verder) | Setup €19,95; woordprijs; bulkdrempel 750 woorden | Zie `pricing_config`: telephonySetupFee, telephonyWordPrice, telephonyBulkThreshold, etc. |
| **Video** (verder) | 200 woorden inbegrepen; daarna €0,20/woord | videoWordThreshold, videoWordRate. |

**Onbetaald proef:** Geen apart tarief; proefopname is gratis. Er is geen veld “tarief onbetaald proef” in Admin Tarieven of in het acteurformulier.

---

## 3. Per-acteur tarieven: wat wordt opgeslagen?

### 3.1 Legacy-kolommen (actors)

| Kolom | Gebruik |
|-------|---------|
| `price_online` | Corporate/Online startprijs (vaak €249); gebruikt ook als fallback voor mediatype “online”. |
| `price_ivr` | Telefonie (vaak €89). |
| `price_live_regie` | Optionele extra vergoeding per uur live regie (Zoom). |
| `price_unpaid` | Optioneel; onbetaald/proef (meestal leeg of 0). |

### 3.2 Master rates (actors.rates, JSONB)

Structuur: `{ "GLOBAL": { "online": 250, "tv_national": 249, ... }, "BE": { ... }, "FR": { ... } }`.

- **Markt:** `GLOBAL` = standaard; `BE`, `NL`, `FR`, … = land-specifiek. Bij berekening: eerst markt, anders GLOBAL.
- **Keys** = service **code** (zoals in `market-manager`: online, tv_national, radio_national, social_media, cinema, tv_regional, tv_local, radio_regional, radio_local, podcast, pos).

Alle mediatypes die in de UI en in de Slimme Kassa gebruikt worden, staan in de onderstaande tabel. **Elke code** hoort bij een **service ID** en bij **buyout** of **all-in**.

---

## 4. Mediatypes: volledige lijst (buyout vs. all-in)

Bepaling: `market-manager.ts` → `getServiceType(serviceId)`. Buyout = BSF €199 + verhoging (schijven €50). All-in = één totaalbedrag (schijven €50).

**Buyout (BSF €199 + verhoging):**

| Service ID | Code | Label (conceptueel) | In acteur-UI |
|------------|------|---------------------|--------------|
| 5 | online | Online Commercial | Ja |
| 6 | radio_national | Radio Nationaal | Ja |
| 9 | tv_national | TV Nationaal | Ja |
| 13 | social_media | Social Media | Ja |
| 14 | cinema | Cinema | Nee (alleen in code; niet in Supabase) |

**All-in (één totaalbedrag):**

| Service ID | Code | Label (conceptueel) | In acteur-UI |
|------------|------|---------------------|--------------|
| 7 | radio_regional | Radio Regionaal | Ja |
| 8 | radio_local | Radio Lokaal | Ja |
| 10 | tv_regional | TV Regionaal | Ja |
| 11 | tv_local | TV Lokaal | Ja |
| 12 | podcast | Podcast Pre-roll | Ja |
| 15 | pos | POS | Nee (alleen in code; niet in Supabase) |

**Overig (geen mediatarief per type in dit overzicht):**

- **live_regie** (1): optioneel bedrag per acteur (`price_live_regie`).
- **ivr** (2): vast platform €89.
- **unpaid** (3): geen tarief / gratis proef.
- **bsf** (4): de €199 basis.

De **Admin → Stemmen → [acteur] → Tarieven**-tab toont alleen de mediatypes uit de tabel hierboven met "In acteur-UI: Ja". Cinema en pos (code-only) staan niet in het formulier.

---

## 5. Vereisten voor een acteur (tarieven)

- **Minimaal:** Er moet voor de acteur een bruikbare prijs zijn voor de journey(s) waarop hij zichtbaar is. In de praktijk: **GLOBAL** in `actors.rates` met ten minste **online** (of legacy `price_online`) voldoende voor corporate/online; **price_ivr** of rates voor telefonie als hij voor IVR wordt aangeboden.
- **Aanbevolen:** Vul voor “Standaard” (GLOBAL) de belangrijkste mediatypes in (online, tv_national, radio_national, eventueel podcast, tv_regional, etc.). Optioneel: per land (BE, NL, FR) afwijkende tarieven.
- **Geen harde API-validatie** dat elk mediatype is ingevuld; de Slimme Kassa valt terug op “Op aanvraag” of GLOBAL als een type ontbreekt.

---

## 6. Signup: welke tarieven?

Bij **actor signup** worden o.a. ingesteld:

- **price_online:** vaak 249 (Corporate/Video).
- **price_ivr:** vaak 89 (Telefonie).
- **price_unpaid**, **price_live_regie:** indien ingevuld.
- **rates.GLOBAL:** o.a. `online: '249'`, `ivr: '89'`, optioneel `unpaid`, `live_regie`.

Na goedkeuring vult admin in het acteurformulier de overige mediatarieven in (buyout/all-in per type).

---

## 7. Admin UI: wat moet er staan?

### 7.1 Admin → Tarieven (`/admin/rates`)

- Platform Tarieven: BSF, Telefonie (basis, setup, woord, bulk), Video (drempel, woordtarief), BTW, toeslagen (muziek, etc.), Academy/Studio, Johfrai-plannen.
- Geen per-acteur velden; die horen bij Stemmen → [acteur] → Tarieven.

### 7.2 Stemmen → [acteur] bewerken → tab Tarieven

- **Mediatarieven:** Per markt (Standaard/GLOBAL + optioneel BE, NL, FR, …) per mediatype:
- **Grote Campagnes (Buyout):** online, tv_national, radio_national, social_media.
- **Kleinere Campagnes (All-in):** tv_regional, tv_local, radio_regional, radio_local, podcast.
- **Extra opties:** Live regie (ja/nee + bedrag indien ja).
- **Geen** invoer voor Telefonie (€89) of Corporate/Video (€249): die zijn vast.

Uitleg op de tab: vaste tarieven Telefonie €89 en Corporate €249; bij Paid Media de buyout-verhoging of all-in in schijven van €50; platformfee 25%.

---

## 8. Technische referentie

| Onderdeel | Bestand / tabel |
|-----------|------------------|
| Default BSF, Video, Telefonie, toeslagen | `apps/web/src/lib/engines/pricing-engine.ts` → `DEFAULT_KASSA_CONFIG`, `SlimmeKassaConfig` |
| Opslag globale tarieven | Supabase `app_configs` (key `pricing_config`) |
| Admin UI platformtarieven | `apps/web/src/app/admin/rates/page.tsx`; laadt/opslaat via `/api/pricing/config` en `/api/admin/config` |
| Buyout vs. all-in | `apps/web/src/lib/system/core/market-manager.ts` → `getServiceType(serviceId)`; buyoutIds = [5, 6, 9, 13, 14] |
| Service ID ↔ code | `market-manager.ts` → `getServiceId(code)` (staticMap) |
| Per-acteur tarieven | `actors.rates` (JSONB); legacy: `price_online`, `price_ivr`, `price_live_regie`, `price_unpaid` |
| Actor-edit tarieven-tab | `ActorEditModal.tsx` / `ActorEditModalInstrument.tsx` → tab “Tarieven”, RateSelector, schijven €50 |
| Prijsberekening | `SlimmeKassa.calculate()` gebruikt `actorRates` + `config`; `resolveServicePrice()` voor markt/GLOBAL/legacy |

---

## 9. Casting (proefopname) en prijs

Bij **proefopname/casting** worden dezelfde velden als de configurator verzameld (journey, usage, mediatype, script, gekozen stemmen). Daardoor kan de **Slimme Kassa** al bij casting submit de prijs berekenen; die wordt opgeslagen in orders_v2/order_items. Geen volledige info = geen casting (zie doc 23, sectie 7). Zo is “omzetten tot opdracht” één knop, zonder ontbrekende of foute gegevens.

**Edge cases (cinema/pos):** Als een request toch `cinema` of `pos` als mediatype bevat (bijv. via API of import), geeft de Slimme Kassa geen fout: `getServicePrice` retourneert 0, het resultaat krijgt `isQuoteOnly: true` en een `quoteReason` (bijv. dat het mediatype niet in de acteur-UI instelbaar is). Support en developers kunnen daaraan zien dat het om een code-only type gaat.

---

## 10. Samenvatting

- **Platform:** BSF €199, Video €249, Telefonie €89, platformfee 25%; beheer via Admin → Tarieven.
- **Per acteur:** Mediatarieven in `actors.rates` (GLOBAL + optioneel per land); buyout-typen = €199 + verhoging (€50, €100, …), all-in = één bedrag (€50, €100, …). Live regie optioneel.
- **Mediatypes in acteur-UI:** 4 buyout (online, tv_national, radio_national, social_media) en 5 all-in (tv_regional, tv_local, radio_regional, radio_local, podcast). Cinema en pos bestaan alleen in de code en worden niet in het formulier getoond.
- **Signup:** price_online, price_ivr, rates.GLOBAL (online, ivr, unpaid, live_regie); rest na goedkeuring in admin.

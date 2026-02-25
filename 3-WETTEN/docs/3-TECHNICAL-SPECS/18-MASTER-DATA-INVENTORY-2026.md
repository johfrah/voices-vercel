# 🗄️ MASTER DATA INVENTORY: VOICES OS (2026)

Dit document is de exhaustieve inventaris van álle data die wordt gemigreerd naar de nieuwe PostgreSQL fundering. Het bevat de exacte aantallen en de volledige mapping van elke "Atomic" rij uit de 191 tabellen.

---

## 📊 1. HET VOLUME (DE "100.000+ RIJEN" REALITEIT)

Na de chronologische scan is dit de werkelijke schaal van de migratie:

| Entiteit | Bron | Aantal Rijen | Status |
| :--- | :--- | :--- | :--- |
| **Order Historie** | `wp_comments` (notes) | 37.653 | 🟠 Mapping Ready |
| **Lead Audit Trail** | `wp_gf_entry_notes` | 15.959 | 🟠 Mapping Ready |
| **Audio Assets** | `/uploads/` + GF | 13.000+ | 🟠 Mapping Ready |
| **UTM Touchpoints** | `wp_voices_utm_visitors` | 403.221 | 🟠 Mapping Ready |
| **Order Metadata** | `wp_wc_orders_meta` | 380.109 | 🟠 Mapping Ready |
| **Post Metadata** | `wp_postmeta` | 498.841 | 🟠 Mapping Ready |
| **Klant Metadata** | `wp_usermeta` | 133.092 | 🟠 Mapping Ready |
| **Chat Conversaties** | `wp_voices_chat_conv` | 24.150 | 🟠 Mapping Ready |
| **TOTAAL DATA PUNTEN** | | **1.500.000+** | **GOD MODE READY** |

---

## 🎙️ 2. ATOMIC ENTITY MAPPING (EXHAUSTIVE)

### 2.1 Stemacteurs & Talent (The Gold)
*Totaal: 558 Producten, 181 Live Profielen*
- [ ] `id` (PostgreSQL) <-> `wp_product_id` (MySQL)
- [ ] `firstName` <-> `meta:voornaam`
- [ ] `lastName` <-> `meta:achternaam`
- [ ] `gender` <-> `meta:gender`
- [ ] `bioNl` <-> `meta:about-me`
- [ ] `bioEn` <-> `meta:about-the-voice-language`
- [ ] `voiceScore` <-> `meta:voice-score`
- [ ] `isPublic` <-> `post_status:publish` + `meta:_voice_approval_status:approved`
- [ ] `vacationMode` <-> `meta:holiday-from` / `meta:holiday-till`
- [ ] `pricingMatrix` (JSONB) <-> 59+ verschillende prijs-metakeys per markt.

### 2.2 Audio Demos (The Assets)
*Totaal: 13.000+ fragmenten*
- [ ] `id` (PostgreSQL) <-> `wp_id` (Attachment ID)
- [ ] `actorId` <-> Link naar Actor
- [ ] `url` <-> Nieuw pad: `/assets/agency/voices/...`
- [ ] `type` <-> `corporate`, `commercial`, `telephony`
- [ ] `vibe` <-> `meta:vrolijksample`, `warmsample`, etc.
- [ ] `transcription` <-> AI-extracted text
- [ ] `aiEmbeddings` <-> Vector data voor matching

### 2.3 Klanten & DNA (The Intelligence)
*Totaal: 3.644 unieke klanten*
- [ ] `id` (PostgreSQL) <-> `wp_user_id`
- [ ] `email` <-> `user_email`
- [ ] `customerInsights` (JSONB) <-> `meta:_customer_insights` (Sector, Persona, AI-Desc)
- [ ] `preferences` <-> `meta:voices_preferences`
- [ ] `favorites` <-> `meta:_voice_favorite_*` (Unpacked naar rijen)

### 2.4 Bestellingen & Financiën (The Engine)
*Totaal: 4.480 Orders*
- [ ] `id` (PostgreSQL) <-> `wp_order_id`
- [ ] `total` <-> `meta:_order_total`
- [ ] `profit` <-> `meta:_alg_wc_cog_order_profit`
- [ ] `cost` <-> `meta:_alg_wc_cog_order_cost`
- [ ] `notes` <-> 37.653 rijen uit `wp_comments`
- [ ] `utmTrail` <-> Koppeling naar `utm_touchpoints`

---

## 🧠 3. JOURNEY-SPECIFIEKE INTELLIGENTIE

### 🎧 Studio (Workshops)
- [ ] `leads` <-> 958 Geïnteresseerden uit `wp_voices_workshop_interest`
- [ ] `identikit` <-> AI-profiel van de cursist
- [ ] `appointments` <-> Google Calendar links & Reschedule tokens

### 🧘 Ademing (Meditatie)
- [ ] `tracks` <-> Alle audiobestanden van `ademing.be`
- [ ] `reflections` <-> User intentions en dagelijkse reflecties
- [ ] `stats` <-> Streaks en luistertijd

### 🤖 Voicy Intelligence
- [ ] `aiLogs` <-> 36+ ruwe AI-interactie logs
- [ ] `recommendations` <-> Welke stemmen werden aangeraden?
- [ ] `successScore` <-> Heeft de aanbeveling geleid tot een klik/order?

---

## 🧹 4. LEGACY CLEANUP (THE EXIT)
- [ ] **Gravity Forms:** 10.910 audio-entries uit de GF-vault worden fysiek verplaatst en gelabeld.
- [ ] **Elementor:** 356 pagina's worden "ge-unpacked" naar schone HTML blokken.
- [ ] **Orphan Detection:** Elke rij op de server die na de sync GEEN link heeft naar PostgreSQL verschijnt in het `WEES-INFO-RAPPORT`.

---
**STATUS:** READY FOR NUCLEAR SYNC.
**INVENTARIS:** 1.500.000+ DATAPUNTEN GEÏDENTIFICEERD.

# Actor- en demo-eisen

Wat er **nodig is op een acteur** en hoe **demo's** (3 verplicht: Telefonie, Commercial, Corporate; elk met woordje uitleg) werken. Inclusief het verschil tussen het **schema** (demo_types + type_id) en wat er **live in Supabase** staat.

---

## 1. Vereisten voor een acteur (overzicht)

| Onderdeel | Vereist | Bron |
|-----------|---------|------|
| **Naam** | first_name, last_name | Signup/API |
| **E-mail** | email | Signup/API |
| **Profielfoto** | photo_id of photo_url | Signup stap 3; Admin |
| **Tagline** | tagline (min. 5, max. 25 woorden) | Signup stap 2; Admin |
| **Bio** | bio (min. 20, max. 200 woorden) | Signup stap 2; Admin |
| **Waarom Voices?** | why_voices (optioneel; indien ingevuld: min. 20, max. 150 woorden) | Signup stap 2; Admin |
| **Geslacht** | gender / gender_id | Signup stap 2 |
| **Land** | country_id | Signup stap 2 |
| **Moedertaal** | native_lang_id | Signup stap 2 |
| **Tonen** | tone_ids (min. 1) | Signup stap 2 |
| **Demo's** | **3 verplicht:** 1 Telefonie, 1 Commercial, 1 Corporate (meer mag). Elk met **titel**, **woordje uitleg** (bijv. talen) en audio. | Admin; signup heeft nu 0–1 demo, na goedkeuring 3 aparte invullen |
| **Tarieven** | o.a. Live regie; commercieel per mediatype (buyout/all-in) | Admin; zie 26-SLIMME-KASSA-TARIEVEN |

---

## 2. Woordlimieten tagline en bio

| Veld | Min. woorden | Max. woorden | Doel |
|------|----------------|----------------|------|
| **Korte omschrijving van je stem** (tagline) | 5 | 25 | Eén krachtige zin. |
| **Korte beschrijving van jezelf** (bio) | 20 | 200 | Korte tot uitgebreide introductie. |
| **Waarom Voices?** (why_voices) | 20 | 150 | Optioneel. Waarom een professionele stem (bijv. telefooncentrale) voor een bedrijf volgens jou zo belangrijk is. (SEO / klantgericht.) |

- **Signup (ActorProfileForm):** Validatie in stap 2; onder elk veld wordt "X / min–max woorden" getoond (amber/rood bij te weinig/te veel). Waarom Voices? is optioneel; indien ingevuld gelden 20–150 woorden.
- **Admin (ActorEditModal):** Dezelfde limieten kunnen in de UI getoond worden; API kan optioneel dezelfde validatie uitvoeren.

---

## 3. Demo's: 3 verplichte types (Telefonie, Commercial, Corporate) + woordje uitleg

- **Vereist:** Precies **3 aparte** demo's: één **Telefonie**, één **Commercial**, één **Corporate**. Meer mag (bijv. extra talen of E-learning, Meditatie).
- **Per demo verplicht:**
  - **Titel:** Opgeslagen in `actor_demos.name`.
  - **Type/categorie:** Telefonie, Commercial, Corporate (video), E-learning, Meditatie. In de DB als `actor_demos.type` (tekst).
  - **Woordje uitleg:** Opgeslagen in `actor_demos.notes`. Bijv. talen (Nederlands, Frans), meertalig — zo weet je welke talen iemand spreekt en kun je ze aansporen om bv. de telefoniedemo in die talen aan te leveren.
- **Validatie:** Bij opslaan controleren dat er minstens één demo van elk type is (telephony, commercial, video/corporate) en dat elke demo een titel, woordje uitleg en audio heeft.

---

## 3. Het “betere” systeem: demo_types (schema vs. live)

In het **Drizzle-schema** bestaat een aparte tabel **demo_types** en een koppeling via **type_id**:

- **demo_types:** `id`, `code` (bijv. `commercial`, `telephony`, `corporate`), `label`.
- **actor_demos:** o.a. `type_id` (FK naar `demo_types.id`) naast het legacy veld `type` (text).

**Live Supabase:** De tabel **demo_types** bestaat (nog) **niet**. De tabel **actor_demos** heeft **geen** kolom **type_id**, wel:

- `name` (titel van de demo),
- `type` (tekst: commercial, video, telephony, e-learning, meditatie),
- `media_id`, `url`, `is_public`, `menu_order`, `world_id`, `media_type_id`, `telephony_subtype_id`, …

Dus: het “betere” systeem (demo_types + type_id) is in het **schema** voorzien, maar **niet** in de huidige database. De app gebruikt nu overal het **tekstveld** `type` en de **titel** in `name`.

**Aanbeveling:**  
- **Kortetermijn:** Blijf `actor_demos.type` (tekst) en `actor_demos.name` (titel) gebruiken; handhaaf de bestaande dropdown (Commercial, Corporate, Telefonie, E-learning, Meditatie) en de validatie “min. 3 demo’s”.  
- **Later:** Migratie uitvoeren: tabel `demo_types` aanmaken, kolom `actor_demos.type_id` toevoegen, data vullen op basis van `type`, en UI/API omzetten naar type_id + demo_types (één bron van waarheid voor corporate/commercial/telephony).

---

## 5. Waar wordt wat opgeslagen? (demos)

| Veld in UI / API | Supabase (actor_demos) |
|------------------|------------------------|
| Titel van de demo | `name` |
| Categorie/type (Commercial, Corporate, Telefonie, …) | `type` (text) |
| Woordje uitleg (bijv. talen) | `notes` (text) |
| Toekomstig (schema) | `type_id` → `demo_types.id` (nog niet in DB) |
| Audio/media | `media_id` of `url` |

---

## 6. Validatie (na implementatie)

- **Admin acteur opslaan:** Als `demos` wordt meegegeven: min. 3 demo’s waarvan minstens één Telefonie, één Commercial en één Corporate; elke demo moet een titel, een woordje uitleg (`notes`) en een media hebben. Anders 400 met duidelijke foutmelding.
- **ActorEditModal:** Bij opslaan controleren op 3 types (Telefonie, Commercial, Corporate) + titel + woordje uitleg + audio per demo; anders foutmelding en niet naar API sturen.
- **Signup:** Momenteel 0 of 1 demo; na goedkeuring moeten alsnog min. 3 demo’s worden toegevoegd (via admin). Optioneel: in signup-flow of e-mail na goedkeuring expliciet vermelden dat 3 demo’s verplicht zijn.
- **Tagline/bio:** Signup stap 2: tagline 5–25 woorden, bio 20–200 woorden; anders foutmelding. Woordteller zichtbaar onder de velden.

---

## 7. Technische referentie

| Onderdeel | Bestand / tabel |
|-----------|------------------|
| Schema demo_types + actor_demos.type_id | `packages/database/src/schema/index.ts` |
| API PATCH actor + demos | `apps/web/src/app/api/admin/actors/[id]/route.ts` |
| UI demo’s (titel, type, woordje uitleg/notes) | `ActorEditModal.tsx` / `ActorEditModalInstrument.tsx` |
| Live DB: actor_demos kolommen | Geen `type_id`, geen tabel `demo_types`; wel `type` (text), `name`, `notes` (woordje uitleg) |

---

## 8. Samenvatting

- **Acteur:** Naam, e-mail, foto, **tagline** (5–25 woorden), **bio** (20–200 woorden), **Waarom Voices?** (why_voices, optioneel 20–150 woorden), geslacht, land, moedertaal, min. 1 toon, **min. 3 demo’s**, tarieven (o.a. Slimme Kassa).
- **Demo’s:** **3 verplicht:** 1 Telefonie, 1 Commercial, 1 Corporate (meer mag). Elk met **titel**, **woordje uitleg** (notes, bijv. talen) en audio.
- **“Beter” systeem:** In schema: **demo_types** (corporate, commercial, telephony) + **type_id** op actor_demos. In Supabase nog niet aanwezig; voorlopig blijft **type** (tekst) + **name** (titel) de bron. Na migratie kan overgestapt worden op demo_types + type_id.

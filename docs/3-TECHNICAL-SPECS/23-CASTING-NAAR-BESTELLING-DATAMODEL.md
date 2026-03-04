# Casting → bestelling: datamodel en overgang

**Vraag:** Gebruiken casting (proefopname) en bestelling dezelfde Supabase-tabel? En hoe gaat een project in castingfase (meerdere stemmen, briefing) over in een aankoop zodra goedgekeurd?

---

## 1. Huidige situatie: twee parallelle structuren

| Aspect | **Casting (proefopname)** | **Bestelling (order)** |
|--------|---------------------------|--------------------------|
| **Hoofdtabel** | `casting_lists` (1 rij = 1 project) | `orders` (1 rij = 1 bestelling) |
| **Regels / stemmen** | `casting_list_items` (list_id, actor_id) | `order_items` (order_id, actor_id, price, meta_data) |
| **Briefing per stem** | Zelfde script in `casting_lists.settings` (gedeeld) | Per regel in `order_items.meta_data` (script, usage, …) |
| **Extra** | `auditions` (user_id, actor_id, status, script, briefing; **order_id optioneel**) | — |

Dus: **nee**, ze gebruiken **niet** dezelfde tabel. Casting = `casting_lists` + `casting_list_items` + `auditions`. Bestelling = `orders` + `order_items`.

- **Eén project, meerdere stemmen:** Ja. Eén `casting_list` met meerdere `casting_list_items`; alle stemmen krijgen dezelfde briefing (script in `settings`). Per stem wordt ook een `auditions`-rij aangemaakt (status o.a. `invited`).
- **Overgang naar aankoop:** Nu nog **niet** geïmplementeerd. Er is geen flow “goedkeuren → maak order aan uit deze casting”.

---

## 2. Wat er moet gebeuren bij “goedkeuring” (stemopname → aankoop)

Conceptueel:

1. Admin (of klant) keurt één of meerdere stemmen goed voor een casting-project.
2. Dat project gaat over in een **bestelling**: er komt een factuur/betaling, en de opnames worden als “order” afgehandeld.

Dat kan op twee manieren:

---

### Optie A: Twee tabellen houden + “promote” flow

Blijf `casting_lists` en `orders` apart gebruiken. Bij goedkeuring:

1. **Order aanmaken** uit de casting:
   - `orders`: user_id, total (berekend), status, journey, iap_context (verwijzing naar casting_list_id of hash).
2. **Order_items** vullen uit de goedgekeurde stemmen:
   - Per goedgekeurde stem: 1 `order_item` (order_id, actor_id, name, price, meta_data met script/briefing uit casting).
3. **Auditions koppelen aan de order:**
   - `auditions.order_id` zetten voor de betreffende auditie(s), zodat “deze auditie hoort bij deze bestelling”.

**Nodig in de data:**

- **Koppeling auditions ↔ casting:** Nu heeft `auditions` geen `casting_list_id`. Je kunt:
  - ofwel bij aanmaak van auditions (in casting submit) een `casting_list_id` (of `list_id`) meegeven en in `auditions` een kolom `casting_list_id` toevoegen;
  - ofwel later bij “promote” matchen op (user_id, actor_id, script, created_at) — broos.

Aanbevolen: **`auditions.casting_list_id` (FK naar casting_lists.id)** toevoegen en bij submit al vullen. Dan weet je bij goedkeuring exact welke auditions bij welk project horen.

---

### Optie B: Eén “project”-tabel met fase (casting vs order)

Eén hoofdtabel die zowel “project in castingfase” als “bestelling” kan zijn, bijvoorbeeld:

- **`projects`** (of hergebruik `orders` met uitgebreide status):
  - id, user_id, name, hash (voor proefopname-link), **phase**: `'casting' | 'order'`
  - settings / iap_context (script, vibe, …)
  - Bij overgang naar aankoop: total, status, payment_method_id, etc. vullen; phase = `'order'`.
- **Regels:** één tabel “project_items” of “order_items” met o.a. project_id, actor_id, type (bijv. “audition” vs “order_line”), price (nullable in casting), status.

Voordeel: één bron van waarheid; “hetzelfde project” verandert alleen van fase. Nadeel: grotere migratie en aanpassing van bestaande flows (casting submit, checkout, admin).

---

## 3. Aanbevolen aanpak (pragmatisch)

**Fase 1 – Met huidige tabellen:**

1. **Schema:**
   - Kolom **`auditions.casting_list_id`** (FK naar `casting_lists.id`) toevoegen.
   - In **`/api/casting/submit`**: bij elke `auditions.insert` ook `casting_list_id` = de net aangemaakte `casting_list.id` meegeven (na het aanmaken van de list).

2. **Promote-flow (nieuw endpoint of admin-actie):**
   - Input: `casting_list_id` (of hash) + optioneel welke actor_ids goedgekeurd zijn (default: alle).
   - Logica:
     - Order aanmaken (`orders`: user_id, total, status, journey; eventueel iap_context of meta met casting_list_id).
     - Per goedgekeurde stem: `order_items` aanmaken (actor_id, name, price, meta_data met script/briefing uit `casting_lists.settings`).
     - Voor de bijbehorende auditions: `auditions.order_id` = nieuwe order.id (en eventueel status op bv. `approved`).

3. **Totalen:** Prijs per stem moet ergens vandaan komen (pricing engine / product). Of je zet eerst een “offerte”-order (total 0 of TBD) en later definitieve prijs; dat hangt af van jullie commercieel flow.

**Fase 2 (optioneel later):**

- Als je wilt dat casting en bestelling dezelfde **vorm** in de UI hebben (zie doc 22), kun je in de applicatielaag een “project”-abstractie bouwen die óf een casting_list óf een order leest en dezelfde stappen/overzicht toont. De opslag kan dan nog steeds A (twee tabellen + promote) blijven.

---

## 4. Kort antwoord op de vragen

| Vraag | Antwoord |
|-------|----------|
| Zelfde Supabase-tabel als orders? | **Nee.** Casting = `casting_lists` + `casting_list_items` (+ `auditions`). Bestelling = `orders` + `order_items`. |
| Project in castingfase, meerdere stemmen, briefing? | **Ja.** Eén `casting_list` = één project; meerdere `casting_list_items` = meerdere stemmen; briefing (script, vibe) in `casting_lists.settings`. |
| Hoe gaat het over in aankoop? | **Nu nog nergens.** Aanpak: auditions koppelen aan casting_list (`casting_list_id`); bij goedkeuring “promote” doen: 1 order + N order_items uit de list, auditions.order_id zetten. |

Als je wilt, kan de volgende stap zijn: een concreet migratie-voorstel (SQL voor `auditions.casting_list_id`) en de signature van het “promote”-endpoint (parameters, stappen, waar het in de app wordt aangeroepen).

---

## 5. Account: één beeld "projecten" (casting = pre-aankoopfase)

**Principe:** Casting blijft **laagdrempelig** (geen checkout, alleen formulier proefopname). In het account moet het wél hetzelfde aanvoelen: één lijst "projecten", waarbij casting een **project in pre-aankoopfase** is. Alles is al ingevuld (mediatype, journey, script, stemmen) zodat een aankoop makkelijk kan doorgaan.

| Waar | Bedoeling |
|------|-----------|
| **Casting (buiten account)** | Gebruiker vult alleen proefopname-formulier in; gaat **niet** via checkout. |
| **Account Mijn projecten** | Zelfde overzicht: casting-projecten als "Proefopname / Pre-aankoopfase" met CTA "Bestel nu". |
| **Data** | In casting_lists.settings alles wat checkout nodig heeft (journey, usage, script, media, stemmen) al opslaan, zodat "Bestel nu" de checkout **pre-vult**. |

**Aanbeveling data:** Bij casting submit in settings expliciet zetten: journey (bv. agency), usage (paid/unpaid/telefonie) vanuit het formulier.

**Implementatie (richting):** Customer-360 uitbreiden met casting_lists; op account/orders casting-projecten tonen als pre-aankoop met CTA "Bestel nu" → /checkout?fromCasting=hash; checkout pre-vult uit casting_list.

---

## 6. Consolidatie: orders_v2 als single source of truth

**Principe:** De **orders_v2**-tabel is de waarheid voor alle “projecten” (zowel proefopname als bestelling). Casting wordt daarop afgestemd zodat één lijst (account, admin, UCI) uit één bron komt.

### 6.1 Huidige rol van orders_v2

| Kolom | Betekenis |
|-------|-----------|
| `id` | PK (bigint); bij echte bestellingen = WP-order-ID; bij casting = gegenereerd project-ID |
| `user_id` | Eigenaar van het project |
| `world_id`, `journey_id` | World/journey (agency, studio, …) |
| `status_id` | → `order_statuses` (o.a. casting, pending, completed) |
| `payment_method_id` | Nullable bij casting |
| `amount_net`, `amount_total` | Bij casting 0 of null |
| `legacy_internal_id` | → `orders.id`; gebruikt om `order_items` te koppelen (items zitten op legacy `orders`) |

Regels (stemmen, script, usage) staan in **order_items** (via `orders.id` = `orders_v2.legacy_internal_id`). Extra context (script, vibe, usage) kan in **orders.iap_context** of **orders.raw_meta**.

### 6.2 Keuze: één model vanaf het begin

Casting **niet** meer als aparte “casting_list” bijhouden, maar **direct** als project in het order-model:

1. **Eén bron voor “projecten”:** Alles wat in account/admin als project of bestelling getoond wordt, komt uit **orders_v2** (eventueel met join op `orders` voor hash/context).
2. **Zelfde regels-tabel:** De stemmen van een proefopname zijn gewoon **order_items** (order_id = legacy `orders.id`), met bv. `price` null of 0 en `meta_data` voor script/usage.
3. **Promote = status + bedragen:** Overgang naar aankoop = status en bedragen op de bestaande orders_v2/orders/order_items zetten; geen kopie van casting naar order.

Daarmee verdwijnen **casting_lists** en **casting_list_items** voor de nieuwe flow (na migratie van bestaande data).

### 6.3 Benodigde aanpassingen (consolidatie)

| Onderdeel | Actie |
|-----------|--------|
| **order_statuses** | Status toevoegen met code `casting` (of `pre_order`) voor projecten in proefopnamefase. |
| **orders (legacy)** | Kolom **proefopname_hash** (text, unique, nullable) toevoegen. Bij casting: hash vullen voor link `/proefopname/{hash}`. |
| **Casting submit** | Geen insert in `casting_lists` / `casting_list_items`. Wel: (1) insert **orders** (status bv. `casting`, journey, iap_context, proefopname_hash), (2) insert **order_items** per gekozen stem (actor_id, meta_data met script/usage), (3) insert **orders_v2** (id = gegenereerd project-id, status_id = casting, amount_total = 0, legacy_internal_id = orders.id). |
| **slug_registry** | Slug `proefopname/{hash}` koppelen aan **entity_id = orders_v2.id** (of aan orders.id als resolver op orders werkt), entity_type_id ongewijzigd (casting/proefopname). |
| **Proefopname-pagina** | Resolutie via hash → orders_v2 (of orders) + order_items + actors; geen casting_lists meer. |
| **Account / UCI** | Blijft alleen orders_v2 (+ joins) gebruiken; casting-projecten zijn orders_v2 met status “casting”. |
| **Promote** | Bestaande orders_v2/orders/order_items: status en bedragen updaten; eventueel payment_method_id en facturatiegegevens zetten. Geen nieuwe order aanmaken uit casting_list. |

### 6.4 ID voor casting-projecten (orders_v2.id)

Nu is `orders_v2.id` in de praktijk een WP-achtige ID. Voor projecten die nog geen WP-order zijn:

- Gebruik een **eigen id-bereik** voor “projecten” (bv. sequence of offset, bv. 5 000 000 000 + orders.id), zodat er geen botsing is met echte WP-order-IDs, **of**
- Introduceer een **aparte sequence** voor orders_v2 wanneer er geen wp_order_id is.

Zolang het bigint uniek is en niet met WP verward wordt, is het bruikbaar.

### 6.5 Migratie bestaande casting_lists (optioneel)

- Bestaande rijen in **casting_lists** omzetten naar: 1× **orders** (met proefopname_hash, status casting, iap_context uit settings), N× **order_items** (uit casting_list_items + settings), 1× **orders_v2** (gekoppeld via legacy_internal_id).
- Daarna: **slug_registry** voor bestaande proefopname-hashes laten wijzen naar de nieuwe orders_v2.id (of orders.id).
- Als alles omgezet is: casting_lists / casting_list_items niet meer gebruiken voor nieuwe data; tabellen later kunnen deprecaten of archiveren.

### 6.6 Kort overzicht

| Vraag | Antwoord na consolidatie |
|-------|--------------------------|
| Waar is de waarheid voor “project”? | **orders_v2** (en gekoppeld orders + order_items). |
| Waar staat casting? | Als orders_v2 met status “casting” + bijbehorende orders (met proefopname_hash) en order_items. |
| Zelfde tabel als bestelling? | **Ja:**zelfde tabellen; onderscheid via status (casting vs. betaald/offerte). |
| Promote? | Status en bedragen bijwerken op de bestaande orders_v2/orders/order_items; geen dubbele structuur. |

---

## 7. Volledige configuratie = voorwaarde voor casting (prijs direct berekend)

**Principe:** Een casting mag alleen bestaan als we **dezelfde gegevens** hebben die de masterconfigurator / Slimme Kassa nodig heeft. Geen volledige info = geen casting. Daardoor kunnen we **meteen de prijs berekenen** voor de gekozen stemmen (commercial, video, IVR, …) en komt alle data handshake-klaar in Supabase. Omzetten naar opdracht wordt **één knop**, zonder foute of onvolledige klantgegevens.

### 7.1 Waarom

- De **Slimme Kassa** (zie doc 26) heeft voor een prijsberekening o.a. nodig: journey, usage/mediatype (paid/unpaid/ivr/video), scriptlengte, eventueel markt, en per stem de acteur (voor `actors.rates`). Dat zijn precies de velden die we bij een proefopname kunnen vragen.
- Als we die velden **verplicht** maken bij casting submit, dan:
  1. **Prijs bij submit:** We roepen dezelfde prijslogica aan (Slimme Kassa / pricing-engine) en slaan het resultaat op (per stem en totaal).
  2. **Eén bron van waarheid:** orders_v2 + orders + order_items bevatten meteen de juiste commercial_specs / usage / script; geen dubbele of incomplete data later.
  3. **Promote = één knop:** Er is niets meer in te vullen; we zetten alleen status + eventueel betaling/facturatie.

### 7.2 Regel: geen volledige info = geen casting

| Wat | Afspraak |
|-----|----------|
| **Verplichte velden bij casting** | Zelfde set als voor de configurator: o.a. journey, usage (paid/unpaid/ivr/video), mediatype indien paid, script (woordenaantal of ruwe tekst), gekozen stemmen (actor_ids). Alles wat de pricing-engine nodig heeft, moet aanwezig zijn. |
| **Validatie** | Submit weigeren als een verplicht veld ontbreekt; geen “casting zonder prijs” of “prijs later bepalen”. |
| **Opslag** | Berekende prijzen direct opslaan: per regel in **order_items** (price, meta_data met usage/script) en totaal in **orders_v2** (amount_net, amount_total). Zo is het project meteen order-klaar. |

### 7.3 Gevolg

- **Casting = pre-gevalideerd project:** Alle data die voor een bestelling nodig is, zit er al in; prijs is bekend.
- **Omzetten tot opdracht:** Eén actie (knop of admin-actie): status casting → pending/offerte en eventueel payment_method_id / facturatie; geen extra formulier of correctie door de klant.
- **Handshake in Supabase:** Geen foute of onvolledige gegevens in de pipeline; alles sluit aan op dezelfde configurator- en tarieflogica (doc 26).

---

## 8. Implementatie-checklist (orders_v2 + prijs bij casting)

Gebruik deze lijst om de consolidatie en “prijs bij submit” stapsgewijs door te voeren. Zie ook `.cursor/rules/420-CASTING-ORDERS-V2.mdc`.

| # | Onderdeel | Actie | Status |
|---|-----------|--------|--------|
| 1 | **Schema** | Migratie: `orders.proefopname_hash` (text, unique, nullable). | |
| 2 | **Schema** | Migratie: `order_statuses` bevat rij met code `casting` (of `pre_order`). | |
| 3 | **orders_v2.id** | Afspraak/implementatie: id voor casting-projecten (sequence of offset, bv. 5e9 + orders.id). | |
| 4 | **Payload** | Eén contract (Zod/type) voor casting submit: journey, usage, mediatype indien paid, script/woordenaantal, actor_ids. | |
| 5 | **API** | Casting submit: validatie verplichte velden; weigeren bij incomplete data. | |
| 6 | **API** | Casting submit: SlimmeKassa.calculate() per stem; alleen persist als prijs berekend. | |
| 7 | **API** | Casting submit: schrijven naar orders + order_items + orders_v2 (niet casting_lists/casting_list_items). | |
| 8 | **Opslag** | order_items.meta_data: script, usage, word_count, media_type/service_code (promote geen extra data nodig). | |
| 9 | **Routing** | slug_registry: proefopname/{hash} → entity_id = orders_v2.id (of orders.id). | |
| 10 | **Proefopname-pagina** | Resolutie via hash → orders_v2 + orders + order_items (+ actors). | |
| 11 | **Account/UCI** | Casting-projecten tonen als orders_v2 met status casting; CTA “Bestel nu”. | |
| 12 | **Promote** | Endpoint/actie: status + amount/payment op bestaande orders_v2/orders/order_items. | |

# Workshop Interest Form – Handshake met Supabase

## Overzicht

Het **WorkshopInterestForm** (Doe je mee?) stuurt een POST naar `/api/studio/workshop-interest`. De API schrijft naar:

| Laag | Tabel / veld | Wat er gebeurt |
|------|----------------|-----------------|
| **1** | `workshop_interest` | Eén rij per inschrijving (naam, e-mail, doel, verwachtingen, etc.) |
| **2** | `workshop_interest.product_ids` | Legacy: comma-separated workshop-IDs (bv. `"5,12"`) |
| **3** | `workshop_interest_products` | ID-First handshake: één rij per gekozen workshop (interest_id + workshop_id) |

## Form → API → DB mapping

| Form / body | API verwerkt | workshop_interest kolom |
|-------------|--------------|---------------------------|
| first_name, last_name, email | ✓ | first_name, last_name, email |
| phone | ✓ | phone |
| selectedWorkshops (array) | → productIds (string) | product_ids |
| selectedWorkshops (array) | ✓ (na fix) | workshop_interest_products.workshop_id |
| skills_to_sharpen | ✓ | iap_context.skills_to_sharpen |
| expectations | ✓ | iap_context.expectations |
| profession, age, experience, goal | ✓ | profession, age, experience, goal |
| preferred_dates, how_heard | ✓ | preferred_dates, how_heard |
| worldId | ✓ | world_id (indien kolom bestaat) |

## Wat er stond (voor fix)

- **workshop_interest**: werd gevuld; product_ids als comma-separated string.
- **workshop_interest_products**: werd **niet** gevuld → geen echte ID-koppeling interest ↔ workshop.
- **world_id**: werd in de API meegestuurd maar ontbrak in het Drizzle-schema voor `workshop_interest`.

## Wat er nu is (na fix)

- **workshop_interest**: ongewijzigd; world_id toegevoegd aan schema (als de kolom in Supabase bestaat).
- **workshop_interest_products**: na elke nieuwe interest worden rijen toegevoegd: per gekozen workshop één rij (interest_id, workshop_id).
- Queries zoals “alle inschrijvingen voor workshop X” kunnen via `workshop_interest_products` (en eventueel JOIN workshop_interest).

## SQL: controleren in Supabase

```sql
-- Inschrijvingen met hun gekoppelde workshops (na fix)
SELECT
  wi.id AS interest_id,
  wi.first_name,
  wi.email,
  wi.product_ids,
  wi.world_id,
  wip.workshop_id,
  w.title AS workshop_title
FROM workshop_interest wi
LEFT JOIN workshop_interest_products wip ON wip.interest_id = wi.id
LEFT JOIN workshops w ON w.id = wip.workshop_id
ORDER BY wi.created_at DESC, wi.id, wip.workshop_id;
```

Als de handshake goed staat: elke inschrijving met gekozen workshops heeft bijbehorende rijen in `workshop_interest_products` en `product_ids` komt overeen met die workshop_id’s.

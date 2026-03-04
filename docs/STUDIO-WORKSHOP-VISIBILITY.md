# Studio workshops: welke worden wel/niet getoond

De Studio API en doe-je-mee formulier tonen **alleen** workshops die voldoen aan:

- `world_id = 2` (Studio)
- `status IN ('publish', 'live')`
- `is_public = true` **of** `is_public IS NULL`

## SQL in Supabase (SQL Editor)

### 1. Workshops die wél getoond worden (zoals de app ze ophaalt)

```sql
SELECT id, title, slug, status, is_public, world_id
FROM workshops
WHERE world_id = 2
  AND status IN ('publish', 'live')
  AND (is_public IS TRUE OR is_public IS NULL)
ORDER BY title;
```

### 2. Workshops die níet getoond worden (uitgesloten door het filter)

```sql
SELECT id, title, slug, status, is_public, world_id
FROM workshops
WHERE world_id = 2
  AND (
    status NOT IN ('publish', 'live')
    OR is_public IS FALSE
  )
ORDER BY title;
```

- **Niet getoond** door `status`: bv. `draft`, `upcoming`, `cancelled` of andere waarden dan `publish`/`live`.
- **Niet getoond** door `is_public`: rijen met `is_public = false`.

### 3. Overzicht: alle Studio-workshops met “zichtbaar ja/nee”

```sql
SELECT
  id,
  title,
  slug,
  status,
  is_public,
  world_id,
  CASE
    WHEN world_id != 2 THEN 'nee (geen Studio)'
    WHEN status NOT IN ('publish', 'live') THEN 'nee (status: ' || COALESCE(status, 'NULL') || ')'
    WHEN is_public IS FALSE THEN 'nee (is_public = false)'
    WHEN is_public IS TRUE OR is_public IS NULL THEN 'ja'
    ELSE 'nee'
  END AS getoond_op_site
FROM workshops
WHERE world_id = 2
ORDER BY getoond_op_site DESC, title;
```

Zo zie je per workshop of hij op de site (en in de Supabase-connectie) wel of niet getoond wordt.

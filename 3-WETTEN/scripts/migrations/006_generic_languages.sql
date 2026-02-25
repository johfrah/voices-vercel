-- ☢️ NUCLEAR SQL MIGRATION: Generic Languages for Extra Skills (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Add generic language codes (no region) for use as extra languages.

BEGIN;

-- 1. Add Generic Languages
INSERT INTO languages (code, label, is_popular, is_native_only) VALUES
('nl', 'Nederlands (Algemeen)', true, false),
('fr', 'Frans (Algemeen)', true, false),
('en', 'Engels (Algemeen)', true, false),
('de', 'Duits (Algemeen)', true, false),
('es', 'Spaans (Algemeen)', true, false),
('it', 'Italiaans (Algemeen)', true, false),
('pt', 'Portugees (Algemeen)', false, false),
('pl', 'Pools (Algemeen)', false, false)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_native_only = false;

-- 2. Update actor_languages to use generic IDs for extra skills
-- We map the existing regional IDs to the new generic ones for non-native entries.

-- Map for the update:
-- nl-be (1), nl-nl (2) -> nl
-- fr-be (3), fr-fr (4) -> fr
-- en-gb (5), en-us (6) -> en
-- de-de (7) -> de
-- es-es (8) -> es
-- it-it (9) -> it
-- pl-pl (10) -> pl
-- pt-pt (12) -> pt

WITH generic_map AS (
  SELECT id as generic_id, LEFT(code, 2) as lang_prefix
  FROM languages
  WHERE code IN ('nl', 'fr', 'en', 'de', 'es', 'it', 'pt', 'pl')
)
UPDATE actor_languages al
SET language_id = gm.generic_id
FROM languages l, generic_map gm
WHERE al.language_id = l.id
  AND al.is_native = false
  AND LEFT(l.code, 2) = gm.lang_prefix;

COMMIT;

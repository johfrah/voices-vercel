-- ☢️ NUCLEAR SQL MIGRATION: Final Cleanse & Extended Routing Types (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Finalize ID-based truth for artists and expand registry types for Music and Blog.

BEGIN;

-- 1. Artists Table: Trinity of Truth
ALTER TABLE artists ADD COLUMN IF NOT EXISTS native_language_id INTEGER REFERENCES languages(id);

-- Migration of existing artist language data (if any slop exists)
UPDATE artists a
SET native_language_id = l.id
FROM languages l
WHERE LOWER(a.native_lang) = LOWER(l.code) 
   OR LOWER(a.native_lang) = LOWER(l.label)
WHERE a.native_language_id IS NULL;

-- Drop legacy artist column
ALTER TABLE artists DROP COLUMN IF EXISTS native_lang;

-- 2. Actors Table: Final Slop Removal
ALTER TABLE actors DROP COLUMN IF EXISTS tone_of_voice;

-- 3. Slug Registry: Expand Routing Types
-- We don't need to change the schema if it's just text, but we'll update the comment for clarity.
COMMENT ON COLUMN slug_registry.routing_type IS 'actor, artist, article, workshop, language, attribute, country, music, blog';

-- 4. Ensure Blog/Article distinction
-- We use 'article' for CMS pages (Over ons) and 'blog' for actual news/articles.
-- No schema change needed, just a convention for the sync script.

COMMIT;

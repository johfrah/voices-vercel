-- ☢️ NUCLEAR SQL MIGRATION: Trinity of Truth - ID-First Normalization (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Replace legacy text slop with strict ID-based relationships for languages and countries.

BEGIN;

-- 1. Ensure the new strict columns exist (idempotent)
ALTER TABLE actors ADD COLUMN IF NOT EXISTS native_language_id INTEGER REFERENCES languages(id);
ALTER TABLE actors ADD COLUMN IF NOT EXISTS country_id_new INTEGER REFERENCES countries(id);

-- 2. Create a temporary mapping table for language codes to IDs if not already perfect
-- This ensures we match 'nl-BE', 'Nederlands', etc. to the correct ID.
DO $$ 
BEGIN
    -- Update native_language_id based on native_lang text slop
    UPDATE actors a
    SET native_language_id = l.id
    FROM languages l
    WHERE LOWER(a.native_lang) = LOWER(l.code) 
       OR LOWER(a.native_lang) = LOWER(l.label)
    AND a.native_language_id IS NULL;

    -- Update country_id_new based on country_id (legacy integer) or other hints
    -- Assuming country_id was already an ID but we want to be 100% sure it's linked correctly
    UPDATE actors a
    SET country_id_new = c.id
    FROM countries c
    WHERE a.country_id = c.id
    AND a.country_id_new IS NULL;
END $$;

-- 3. Add NOT NULL constraints where possible (optional, but recommended for betonsterk fundering)
-- We'll do this after the data sync script to be safe.

COMMIT;

-- ☢️ NUCLEAR SQL MIGRATION: Remove Legacy Slop (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Finalize the Trinity of Truth by removing redundant text columns.

BEGIN;

-- 1. Rename new columns to final names
-- We first drop the old columns, then rename the new ones to take their place.
-- WARNING: This is a destructive operation. Ensure data is synced!

-- Drop legacy columns
ALTER TABLE actors DROP COLUMN IF EXISTS native_lang;
ALTER TABLE actors DROP COLUMN IF EXISTS country_id;

-- Rename new columns to final names
ALTER TABLE actors RENAME COLUMN native_language_id TO native_language_id; -- Already named well
ALTER TABLE actors RENAME COLUMN country_id_new TO country_id;

-- 2. Add NOT NULL constraints to ensure integrity (optional, depends on if all actors HAVE a language/country)
-- ALTER TABLE actors ALTER COLUMN native_language_id SET NOT NULL;
-- ALTER TABLE actors ALTER COLUMN country_id SET NOT NULL;

COMMIT;

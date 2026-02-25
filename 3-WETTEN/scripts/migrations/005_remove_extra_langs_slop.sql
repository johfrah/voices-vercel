-- ☢️ NUCLEAR SQL MIGRATION: Remove Extra Langs Slop (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Drop the legacy extra_langs text column from actors table.

BEGIN;

-- Drop legacy extra_langs column
ALTER TABLE actors DROP COLUMN IF EXISTS extra_langs;

COMMIT;

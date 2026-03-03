-- ☢️ NUCLEAR SQL MIGRATION: Slug Registry & Trinity of Truth (2026)
-- Target: Supabase / PostgreSQL
-- Purpose: Create the foundation for 100% ID-based routing and data integrity.

BEGIN;

-- 1. Create the Slug Registry table
CREATE TABLE IF NOT EXISTS slug_registry (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  routing_type TEXT NOT NULL, -- 'actor', 'artist', 'article', 'workshop', 'language', 'attribute', 'country'
  entity_id BIGINT NOT NULL,
  journey TEXT NOT NULL,      -- 'agency', 'studio', 'academy', 'artist', 'portfolio'
  market_code TEXT NOT NULL DEFAULT 'ALL',
  canonical_slug TEXT,
  legacy_slugs TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT slug_registry_unique UNIQUE(slug, market_code, journey)
);

CREATE INDEX IF NOT EXISTS idx_slug_registry_slug ON slug_registry(slug);
CREATE INDEX IF NOT EXISTS idx_slug_registry_lookup ON slug_registry(slug, market_code, journey);

-- 2. Add strict ID columns to actors table (Trinity of Truth)
-- We keep the old columns for now to prevent breaking existing code during migration.
ALTER TABLE actors ADD COLUMN IF NOT EXISTS native_language_id INTEGER REFERENCES languages(id);
ALTER TABLE actors ADD COLUMN IF NOT EXISTS country_id_new INTEGER REFERENCES countries(id);

-- 3. Create a view for easy Handshake Truth verification
CREATE OR REPLACE VIEW view_handshake_truth AS
SELECT 
    sr.slug,
    sr.routing_type,
    sr.entity_id,
    sr.journey,
    sr.market_code,
    CASE 
        WHEN sr.routing_type = 'actor' THEN (SELECT first_name || ' ' || last_name FROM actors WHERE id = sr.entity_id)
        WHEN sr.routing_type = 'artist' THEN (SELECT display_name FROM artists WHERE id = sr.entity_id)
        WHEN sr.routing_type = 'article' THEN (SELECT title FROM content_articles WHERE id = sr.entity_id)
        WHEN sr.routing_type = 'workshop' THEN (SELECT title FROM workshops WHERE id = sr.entity_id)
        ELSE 'N/A'
    END as entity_name
FROM slug_registry sr;

COMMIT;

-- 🎙️ CASTING TABLES (GOD MODE 2026)
-- Handmatige creatie van ontbrekende tabellen voor casting-functionaliteit.

CREATE TABLE IF NOT EXISTS "casting_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer REFERENCES "users"("id"),
	"name" text NOT NULL,
	"hash" text UNIQUE NOT NULL,
	"is_public" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "casting_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL REFERENCES "casting_lists"("id") ON DELETE CASCADE,
	"actor_id" integer NOT NULL REFERENCES "actors"("id"),
	"display_order" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);

-- Indexen voor performance
CREATE INDEX IF NOT EXISTS "casting_lists_user_id_idx" ON "casting_lists" ("user_id");
CREATE INDEX IF NOT EXISTS "casting_list_items_list_id_idx" ON "casting_list_items" ("list_id");
CREATE INDEX IF NOT EXISTS "casting_list_items_actor_id_idx" ON "casting_list_items" ("actor_id");

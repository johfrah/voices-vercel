CREATE TABLE IF NOT EXISTS "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" integer,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"alt_text" text,
	"labels" text[],
	"journey" text,
	"category" text,
	"is_public" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "media_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='actor_demos' AND column_name='media_id') THEN
        ALTER TABLE "actor_demos" ADD COLUMN "media_id" integer;
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='actors' AND column_name='youtube_url') THEN
        ALTER TABLE "actors" ADD COLUMN "youtube_url" text;
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ademing_tracks' AND column_name='media_id') THEN
        ALTER TABLE "ademing_tracks" ADD COLUMN "media_id" integer;
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='actor_demos_media_id_media_id_fk') THEN
        ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='ademing_tracks_media_id_media_id_fk') THEN
        ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='actors_slug_unique') THEN
        ALTER TABLE "actors" ADD CONSTRAINT "actors_slug_unique" UNIQUE("slug");
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "vault_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text,
	"file_path" text NOT NULL,
	"mime_type" text,
	"file_size" integer,
	"actor_id" integer,
	"customer_id" integer,
	"project_id" integer,
	"category" text NOT NULL,
	"status" text DEFAULT 'active',
	"ai_metadata" jsonb DEFAULT '{}',
	"is_promoted" boolean DEFAULT false,
	"promoted_media_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_project_id_orders_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_promoted_media_id_media_id_fk" FOREIGN KEY ("promoted_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

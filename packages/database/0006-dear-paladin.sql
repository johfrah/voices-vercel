CREATE TYPE "public"."delivery_status" AS ENUM('waiting', 'uploaded', 'admin_review', 'client_review', 'approved', 'rejected', 'revision');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'pro', 'elite');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."status" ADD VALUE 'unavailable';--> statement-breakpoint
CREATE TABLE "actor_dialects" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"dialect" text NOT NULL,
	"proficiency" text DEFAULT 'native',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approval_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"priority" text DEFAULT 'normal',
	"is_value_sensitive" boolean DEFAULT false,
	"is_brand_sensitive" boolean DEFAULT false,
	"reasoning" text,
	"iap_context" jsonb,
	"payload" jsonb NOT NULL,
	"original_payload" jsonb,
	"rejection_reason" text,
	"user_corrections" text,
	"is_pattern_shift" boolean DEFAULT false,
	"confidence_score" integer,
	"target_id" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_block_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"content" text NOT NULL,
	"settings" jsonb,
	"version" integer NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"change_note" text
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" integer,
	"name" text NOT NULL,
	"tagline" text,
	"bio" text,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "instructors_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"video_url" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"actor_id" integer,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1,
	"price" numeric(10, 2),
	"cost" numeric(10, 2),
	"tax" numeric(10, 2),
	"delivery_status" text DEFAULT 'waiting',
	"delivery_file_url" text,
	"invoice_file_url" text,
	"payout_status" "payout_status" DEFAULT 'pending',
	"meta_data" jsonb,
	"meta" jsonb,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"layout_json" jsonb NOT NULL,
	"iap_context" jsonb,
	"is_published" boolean DEFAULT false,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "page_layouts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "system_knowledge" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"last_synced_at" timestamp DEFAULT now(),
	CONSTRAINT "system_knowledge_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "voicejar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"sequence_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"market" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"vat_number" text,
	"coc_number" text,
	"address" jsonb,
	"social_links" jsonb,
	"legal" jsonb,
	"localization" jsonb,
	"is_manually_edited" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "market_configs_market_unique" UNIQUE("market")
);
--> statement-breakpoint
CREATE TABLE "nav_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"items" jsonb NOT NULL,
	"market" text DEFAULT 'ALL',
	"is_manually_edited" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "nav_menus_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "rate_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"market" text NOT NULL,
	"category" text NOT NULL,
	"rules" jsonb NOT NULL,
	"is_manually_edited" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"context" text,
	"is_manually_edited" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "mail_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"uid" integer NOT NULL,
	"sender" text,
	"recipient" text,
	"subject" text,
	"date" timestamp,
	"html_body" text,
	"text_body" text,
	"thread_id" text,
	"message_id" text,
	"in_reply_to" text,
	"references_header" text,
	"iap_context" jsonb DEFAULT '{}'::jsonb,
	"embedding" vector(1536),
	"is_encrypted" boolean DEFAULT true,
	"is_super_private" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fame_registry" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" text NOT NULL,
	"domain" text,
	"sensitivity_note" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fame_registry_brand_name_unique" UNIQUE("brand_name")
);
--> statement-breakpoint
CREATE TABLE "vault_files" (
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
	"ai_metadata" jsonb DEFAULT '{}'::jsonb,
	"is_promoted" boolean DEFAULT false,
	"promoted_media_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."status";--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ALTER COLUMN "visitor_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_days_min" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_days_max" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "cutoff_time" text DEFAULT '18:00';--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "sameday_delivery" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "pending_bio" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "pending_tagline" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "tone_of_voice" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "clients" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "experience_level" "experience_level" DEFAULT 'pro';--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "studio_specs" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "connectivity" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "availability" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "menu_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "rates" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content_articles" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content_articles" ADD COLUMN "lock_status" text DEFAULT 'unlocked';--> statement-breakpoint
ALTER TABLE "content_articles" ADD COLUMN "locked_by" integer;--> statement-breakpoint
ALTER TABLE "content_articles" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD COLUMN "lock_status" text DEFAULT 'unlocked';--> statement-breakpoint
ALTER TABLE "content_blocks" ADD COLUMN "locked_by" integer;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "market" text DEFAULT 'BE';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "raw_meta" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "display_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "expected_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_quote" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "quote_message" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "quote_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "iban" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_street" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_zip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_country" text DEFAULT 'BE';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "how_heard" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subroles" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_flows" jsonb DEFAULT '["commercial","corporate","telephony"]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "duration" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "event_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "iap_context" jsonb;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD CONSTRAINT "actor_dialects_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_queue" ADD CONSTRAINT "approval_queue_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_block_versions" ADD CONSTRAINT "content_block_versions_block_id_content_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."content_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_block_versions" ADD CONSTRAINT "content_block_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_project_id_orders_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_promoted_media_id_media_id_fk" FOREIGN KEY ("promoted_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uid_account_idx" ON "mail_content" USING btree ("uid","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_id_idx" ON "mail_content" USING btree ("message_id");--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_submissions" ADD CONSTRAINT "course_submissions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_slug_unique" UNIQUE("slug");
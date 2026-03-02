CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary');--> statement-breakpoint
CREATE TYPE "public"."recording_feedback_type" AS ENUM('text', 'audio', 'waveform_marker');--> statement-breakpoint
CREATE TYPE "public"."recording_session_status" AS ENUM('active', 'archived', 'completed');--> statement-breakpoint
CREATE TABLE "actor_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"language_id" integer NOT NULL,
	"is_native" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "actor_languages_actor_id_language_id_key" UNIQUE("actor_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "actor_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"color" text,
	"is_public" boolean DEFAULT false,
	"can_order" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "actor_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "actor_tones" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"tone_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "actor_tones_actor_id_tone_id_key" UNIQUE("actor_id","tone_id")
);
--> statement-breakpoint
CREATE TABLE "ademing_background_music" (
	"id" serial PRIMARY KEY NOT NULL,
	"element" text NOT NULL,
	"audio_url" text NOT NULL,
	"media_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ademing_makers" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_name" text NOT NULL,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"hero_image_url" text,
	"bio" text,
	"website" text,
	"instagram" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ademing_makers_short_name_unique" UNIQUE("short_name")
);
--> statement-breakpoint
CREATE TABLE "agent_prompt_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_id" integer NOT NULL,
	"system_prompt" text NOT NULL,
	"version" integer NOT NULL,
	"change_note" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_prompts_agent_slug_unique" UNIQUE("agent_slug")
);
--> statement-breakpoint
CREATE TABLE "casting_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	"display_order" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "casting_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"hash" text NOT NULL,
	"is_public" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "casting_lists_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"type" text NOT NULL,
	"journey" text,
	"journey_id" integer,
	"note" text,
	"workshop_edition_id" integer,
	"location_id" integer,
	"instructor_id" integer,
	"order_item_id" integer,
	"date" timestamp with time zone,
	"is_partner_payout" boolean DEFAULT false,
	"status" text DEFAULT 'gepland',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "delivery_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "demo_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "demo_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dialects" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"language_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "dialects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "experience_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"base_price_modifier" numeric(3, 2) DEFAULT '1.00',
	"icon" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "experience_levels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "genders" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "genders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "journeys_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"is_popular" boolean DEFAULT false,
	"is_native_only" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "order_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "orders_legacy_bloat" (
	"wp_order_id" bigint PRIMARY KEY NOT NULL,
	"raw_meta" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders_v2" (
	"id" bigint PRIMARY KEY NOT NULL,
	"user_id" integer,
	"world_id" integer,
	"journey_id" integer,
	"status_id" integer,
	"payment_method_id" integer,
	"amount_net" numeric(10, 2),
	"amount_total" numeric(10, 2),
	"purchase_order" text,
	"billing_email_alt" text,
	"created_at" timestamp,
	"legacy_internal_id" integer
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"is_online" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_product_id" integer,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"tier" text,
	"features" jsonb DEFAULT '[]'::jsonb,
	"tier_config" jsonb DEFAULT '{}'::jsonb,
	"is_subscription" boolean DEFAULT false,
	"billing_cycle" text,
	"status" text DEFAULT 'publish',
	"media_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_wp_product_id_unique" UNIQUE("wp_product_id"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "proficiencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "proficiencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "recording_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" "recording_feedback_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"audio_path" text,
	"waveform_timestamp" numeric(10, 3),
	"is_resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recording_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"content" text NOT NULL,
	"notes" text,
	"is_current" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recording_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"order_item_id" integer,
	"conversation_id" integer,
	"status" "recording_session_status" DEFAULT 'active',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitor_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_hash" text NOT NULL,
	"pathname" text NOT NULL,
	"referrer" text,
	"journey" text,
	"market" text,
	"intent" text,
	"event" text DEFAULT 'pageview',
	"iap_context" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voice_tones" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "voice_tones_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "world_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"language_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"vat_number" text,
	"coc_number" text,
	"address" jsonb,
	"social_links" jsonb,
	"legal" jsonb,
	"seo_data" jsonb,
	"localization" jsonb,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "world_configs_world_id_language_id_key" UNIQUE("world_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "worlds_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "actor_dialects" DROP CONSTRAINT "actor_dialects_actor_id_actors_id_fk";
--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "experience_level" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "experience_level" SET DEFAULT 'pro'::text;--> statement-breakpoint
DROP TYPE "public"."experience_level";--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('junior', 'pro', 'senior', 'legend');--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "experience_level" SET DEFAULT 'pro'::"public"."experience_level";--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "experience_level" SET DATA TYPE "public"."experience_level" USING "experience_level"::"public"."experience_level";--> statement-breakpoint
ALTER TABLE "actor_dialects" ALTER COLUMN "dialect" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
ALTER TABLE "actor_demos" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "actor_demos" ADD COLUMN "type_id" integer;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD COLUMN "dialect_id" integer;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD COLUMN "proficiency_id" integer;--> statement-breakpoint
ALTER TABLE "actor_videos" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "gender_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "native_language_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "country_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_date_min" timestamp;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_date_min_priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_config" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "total_sales" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "experience_level_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "average_delivery_time_hours" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "on_time_delivery_rate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "delivery_penalty_days" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "allow_free_trial" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "theme" text DEFAULT 'rust';--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "ademing_series" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "journey_id" integer;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "theme" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "element" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "maker_id" integer;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "series_id" integer;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "series_order" integer;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "video_background_url" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "subtitle_data" jsonb;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "transcript" text;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "central_leads" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "content_articles" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "instructors" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "instructors" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "instructors" ADD COLUMN "vat_number" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "vat_number" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "delivery_status_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "payout_status_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "expected_delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "journey_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "amount_net" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "purchase_order" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billing_email_alt" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "vies_validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "vies_country_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "world_id_new" integer;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "journey_id" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "world_id" text;--> statement-breakpoint
ALTER TABLE "system_events" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "system_knowledge" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "is_locked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "last_audited_at" timestamp;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "audit_log" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "utm_content" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "utm_term" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "journey_state" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "market" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "first_visit_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "journey_id" integer;--> statement-breakpoint
ALTER TABLE "vault_files" ADD COLUMN "world_id" integer;--> statement-breakpoint
ALTER TABLE "actor_languages" ADD CONSTRAINT "actor_languages_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_languages" ADD CONSTRAINT "actor_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_tones" ADD CONSTRAINT "actor_tones_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_tones" ADD CONSTRAINT "actor_tones_tone_id_voice_tones_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."voice_tones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_background_music" ADD CONSTRAINT "ademing_background_music_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_prompt_versions" ADD CONSTRAINT "agent_prompt_versions_prompt_id_agent_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."agent_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_prompt_versions" ADD CONSTRAINT "agent_prompt_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_prompts" ADD CONSTRAINT "agent_prompts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_list_items" ADD CONSTRAINT "casting_list_items_list_id_casting_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."casting_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_list_items" ADD CONSTRAINT "casting_list_items_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casting_lists" ADD CONSTRAINT "casting_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_workshop_edition_id_workshop_editions_id_fk" FOREIGN KEY ("workshop_edition_id") REFERENCES "public"."workshop_editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "costs" ADD CONSTRAINT "costs_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialects" ADD CONSTRAINT "dialects_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD CONSTRAINT "orders_v2_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD CONSTRAINT "orders_v2_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD CONSTRAINT "orders_v2_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD CONSTRAINT "orders_v2_status_id_order_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."order_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD CONSTRAINT "orders_v2_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_feedback" ADD CONSTRAINT "recording_feedback_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_feedback" ADD CONSTRAINT "recording_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_scripts" ADD CONSTRAINT "recording_scripts_session_id_recording_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."recording_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_configs" ADD CONSTRAINT "world_configs_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_configs" ADD CONSTRAINT "world_configs_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_type_id_demo_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."demo_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD CONSTRAINT "actor_dialects_dialect_id_dialects_id_fk" FOREIGN KEY ("dialect_id") REFERENCES "public"."dialects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD CONSTRAINT "actor_dialects_proficiency_id_proficiencies_id_fk" FOREIGN KEY ("proficiency_id") REFERENCES "public"."proficiencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD CONSTRAINT "actor_dialects_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_videos" ADD CONSTRAINT "actor_videos_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_gender_id_genders_id_fk" FOREIGN KEY ("gender_id") REFERENCES "public"."genders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_native_language_id_languages_id_fk" FOREIGN KEY ("native_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_experience_level_id_experience_levels_id_fk" FOREIGN KEY ("experience_level_id") REFERENCES "public"."experience_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_status_id_actor_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."actor_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD CONSTRAINT "ademing_series_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_maker_id_ademing_makers_id_fk" FOREIGN KEY ("maker_id") REFERENCES "public"."ademing_makers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_series_id_ademing_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."ademing_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "central_leads" ADD CONSTRAINT "central_leads_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq" ADD CONSTRAINT "faq_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_delivery_status_id_delivery_statuses_id_fk" FOREIGN KEY ("delivery_status_id") REFERENCES "public"."delivery_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_id_order_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."order_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_world_id_new_worlds_id_fk" FOREIGN KEY ("world_id_new") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_events" ADD CONSTRAINT "system_events_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_knowledge" ADD CONSTRAINT "system_knowledge_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_series" ADD CONSTRAINT "ademing_series_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_key_lang_unique" UNIQUE("translation_key","lang");
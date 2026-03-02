CREATE TYPE "public"."delivery_status" AS ENUM('waiting', 'uploaded', 'admin_review', 'client_review', 'approved', 'rejected', 'revision');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'pro', 'elite');--> statement-breakpoint
CREATE TYPE "public"."lead_vibe" AS ENUM('cold', 'warm', 'hot', 'burning');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sender_type" AS ENUM('user', 'admin', 'ai');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled', 'unavailable');--> statement-breakpoint
CREATE TABLE "academy_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "actor_demos" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"actor_id" integer NOT NULL,
	"media_id" integer,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"type" text,
	"is_public" boolean DEFAULT true,
	"menu_order" integer DEFAULT 0,
	CONSTRAINT "actor_demos_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "actor_dialects" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"dialect" text NOT NULL,
	"proficiency" text DEFAULT 'native',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "actor_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer NOT NULL,
	"media_id" integer,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"type" text,
	"is_public" boolean DEFAULT true,
	"menu_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "actors" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_product_id" bigint,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"gender" text,
	"native_lang" text,
	"country" text,
	"delivery_time" text,
	"delivery_days_min" integer DEFAULT 1,
	"delivery_days_max" integer DEFAULT 3,
	"cutoff_time" text DEFAULT '18:00',
	"sameday_delivery" boolean DEFAULT false,
	"extra_langs" text,
	"bio" text,
	"pending_bio" text,
	"why_voices" text,
	"tagline" text,
	"pending_tagline" text,
	"tone_of_voice" text,
	"birth_year" integer,
	"location" text,
	"clients" text,
	"photo_id" integer,
	"logo_id" integer,
	"voice_score" integer DEFAULT 10,
	"experience_level" "experience_level" DEFAULT 'pro',
	"studio_specs" jsonb DEFAULT '{}'::jsonb,
	"connectivity" jsonb DEFAULT '{}'::jsonb,
	"availability" jsonb DEFAULT '[]'::jsonb,
	"menu_order" integer DEFAULT 0,
	"price_unpaid" numeric(10, 2),
	"price_online" numeric(10, 2),
	"price_ivr" numeric(10, 2),
	"price_live_regie" numeric(10, 2),
	"rates" jsonb DEFAULT '{}'::jsonb,
	"dropbox_url" text,
	"status" "status" DEFAULT 'pending',
	"is_public" boolean DEFAULT false,
	"is_ai" boolean DEFAULT false,
	"ai_tags" text,
	"elevenlabs_id" text,
	"youtube_url" text,
	"slug" text,
	"website" text,
	"linkedin" text,
	"internal_notes" text,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "actors_wp_product_id_unique" UNIQUE("wp_product_id"),
	CONSTRAINT "actors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ademing_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"intention" text,
	"reflection" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ademing_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "ademing_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"streak_days" integer DEFAULT 0,
	"total_listen_seconds" integer DEFAULT 0,
	"last_activity" timestamp
);
--> statement-breakpoint
CREATE TABLE "ademing_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"media_id" integer,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"duration" integer,
	"vibe" text,
	"is_public" boolean DEFAULT true,
	CONSTRAINT "ademing_tracks_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "ai_clones" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" integer,
	"elevenlabs_voice_id" text NOT NULL,
	"status" text DEFAULT 'active',
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_clones_elevenlabs_voice_id_unique" UNIQUE("elevenlabs_voice_id")
);
--> statement-breakpoint
CREATE TABLE "ai_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" text,
	"event_data" jsonb,
	"full_script" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"message_id" integer,
	"recommended_actor_ids" text,
	"user_clicked" boolean DEFAULT false,
	"user_ordered" boolean DEFAULT false,
	"success_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "app_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"google_event_id" text,
	"user_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'confirmed',
	"reschedule_token" text,
	"location" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "appointments_wp_id_unique" UNIQUE("wp_id")
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
CREATE TABLE "central_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"source_type" text,
	"lead_vibe" text,
	"iap_context" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"user_id" integer,
	"instructor_id" integer,
	"workshop_edition_id" integer,
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"guest_age" integer,
	"guest_profession" text,
	"location_city" text,
	"location_country" text,
	"status" text DEFAULT 'open',
	"resolved" boolean DEFAULT false,
	"journey" text,
	"intent" text,
	"ttfi" integer,
	"effectiveness_score" numeric(3, 2),
	"iap_context" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_conversations_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"conversation_id" integer NOT NULL,
	"sender_id" integer,
	"sender_type" text NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"is_ai_recommendation" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_messages_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "chat_push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"status" text DEFAULT 'publish',
	"user_id" integer,
	"featured_image_id" integer,
	"iap_context" jsonb,
	"seo_data" jsonb,
	"is_manually_edited" boolean DEFAULT false,
	"lock_status" text DEFAULT 'unlocked',
	"locked_by" integer,
	"locked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "content_articles_wp_id_unique" UNIQUE("wp_id"),
	CONSTRAINT "content_articles_slug_unique" UNIQUE("slug")
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
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer,
	"type" text,
	"content" text,
	"settings" jsonb,
	"display_order" integer DEFAULT 0,
	"is_manually_edited" boolean DEFAULT false,
	"lock_status" text DEFAULT 'unlocked',
	"locked_by" integer,
	"locked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"expiry_date" timestamp,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"individual_use" boolean DEFAULT false,
	"exclude_sale_items" boolean DEFAULT false,
	"minimum_amount" numeric(10, 2),
	"maximum_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "course_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"status" text DEFAULT 'in_progress',
	"video_timestamp" integer DEFAULT 0,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "course_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"file_path" text NOT NULL,
	"status" text DEFAULT 'pending',
	"feedback_text" text,
	"feedback_audio_path" text,
	"score_pronunciation" integer,
	"score_intonation" integer,
	"score_credibility" integer,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
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
CREATE TABLE "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"category" text,
	"question_nl" text,
	"answer_nl" text,
	"question_fr" text,
	"answer_fr" text,
	"question_en" text,
	"answer_en" text,
	"question_de" text,
	"answer_de" text,
	"persona" text,
	"journey_phase" text,
	"is_public" boolean DEFAULT true,
	"internal_notes" text,
	"display_order" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"cta" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "faq_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "free_previews" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"company_name" text,
	"phone" text,
	"agreed_to_terms" boolean DEFAULT false,
	"ip_address" text NOT NULL,
	"visitor_hash" text,
	"text_hash" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"user_id" integer,
	"name" text NOT NULL,
	"slug" text,
	"tagline" text,
	"bio" text,
	"photo_id" integer,
	"socials" jsonb DEFAULT '{}'::jsonb,
	"internal_notes" text,
	"admin_meta" jsonb DEFAULT '{}'::jsonb,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "instructors_wp_id_unique" UNIQUE("wp_id"),
	CONSTRAINT "instructors_slug_unique" UNIQUE("slug")
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
	"intro_script" text,
	"deep_dive_script" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text,
	"city" text,
	"zip" text,
	"country" text DEFAULT 'BE',
	"description" text,
	"photo_id" integer,
	"map_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"alt_text" text,
	"labels" text[],
	"journey" text,
	"category" text,
	"is_public" boolean DEFAULT true,
	"is_manually_edited" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "media_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
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
	"edition_id" integer,
	"dropbox_url" text,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"note" text NOT NULL,
	"is_customer_note" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_order_id" bigint,
	"user_id" integer,
	"total" numeric(10, 2),
	"total_tax" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"journey" text NOT NULL,
	"market" text DEFAULT 'BE',
	"iap_context" jsonb,
	"raw_meta" jsonb,
	"display_order_id" text,
	"total_cost" numeric(10, 2),
	"total_profit" numeric(10, 2),
	"expected_delivery_date" timestamp with time zone,
	"billing_vat_number" text,
	"yuki_invoice_id" text,
	"dropbox_folder_url" text,
	"is_quote" boolean DEFAULT false,
	"quote_message" text,
	"quote_sent_at" timestamp,
	"internal_notes" text,
	"is_private" boolean DEFAULT false,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_wp_order_id_unique" UNIQUE("wp_order_id")
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
CREATE TABLE "partner_widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"primary_color" text,
	"allowed_voices" text,
	"discount_percentage" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "partner_widgets_partner_id_unique" UNIQUE("partner_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_slug" text NOT NULL,
	"step_order" integer NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"order_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refunds_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"provider" text DEFAULT 'google_places',
	"business_slug" text,
	"author_name" text NOT NULL,
	"author_url" text,
	"rating" integer NOT NULL,
	"text_nl" text,
	"text_fr" text,
	"text_en" text,
	"text_de" text,
	"response_text" text,
	"conversion_score" numeric(5, 2),
	"iap_context" jsonb,
	"sentiment_velocity" integer DEFAULT 0,
	"language" text DEFAULT 'nl',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reviews_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" text DEFAULT 'info',
	"source" text NOT NULL,
	"message" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "translation_registry" (
	"id" serial PRIMARY KEY NOT NULL,
	"string_hash" text NOT NULL,
	"original_text" text NOT NULL,
	"context" text,
	"last_seen" timestamp DEFAULT now(),
	CONSTRAINT "translation_registry_string_hash_unique" UNIQUE("string_hash")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"translation_key" text NOT NULL,
	"lang" text NOT NULL,
	"original_text" text,
	"translated_text" text,
	"context" text,
	"status" text DEFAULT 'active',
	"is_manually_edited" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_user_id" bigint,
	"wp_id" bigint,
	"photo_id" integer,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"company_name" text,
	"company_sector" text,
	"company_size" text,
	"vat_number" text,
	"iban" text,
	"address_street" text,
	"address_zip" text,
	"address_city" text,
	"address_country" text DEFAULT 'BE',
	"role" text DEFAULT 'guest',
	"how_heard" text,
	"customer_type" text,
	"subroles" jsonb DEFAULT '[]'::jsonb,
	"approved_flows" jsonb DEFAULT '["commercial","corporate","telephony"]'::jsonb,
	"journey_state" text,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"customer_insights" jsonb,
	"activity_log" jsonb DEFAULT '[]'::jsonb,
	"is_manually_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_active" timestamp DEFAULT now(),
	CONSTRAINT "users_wp_user_id_unique" UNIQUE("wp_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "utm_touchpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"order_id" integer,
	"source" text,
	"medium" text,
	"campaign" text,
	"content" text,
	"term" text,
	"url" text,
	"referrer" text,
	"vibe" text,
	"is_first_touch" boolean DEFAULT false,
	"is_last_touch" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_hash" text NOT NULL,
	"user_id" integer,
	"current_page" text,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"company_name" text,
	"location_city" text,
	"location_country" text,
	"is_business" boolean DEFAULT false,
	"last_visit_at" timestamp DEFAULT now(),
	CONSTRAINT "visitors_visitor_hash_unique" UNIQUE("visitor_hash")
);
--> statement-breakpoint
CREATE TABLE "voice_affinity" (
	"id" serial PRIMARY KEY NOT NULL,
	"voice_a_id" integer,
	"voice_b_id" integer,
	"pair_count" integer DEFAULT 1
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
CREATE TABLE "voicejar_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"visitor_hash" text NOT NULL,
	"url" text,
	"user_agent" text,
	"ip_address" text,
	"duration" integer DEFAULT 0,
	"event_count" integer DEFAULT 0,
	"iap_context" jsonb,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voucher_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"batch_id" integer,
	"status" text DEFAULT 'active',
	"user_id" integer,
	"used_at" timestamp,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "workshop_editions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" bigint NOT NULL,
	"title" text,
	"date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"location_id" integer,
	"instructor_id" integer,
	"price" numeric(10, 2),
	"capacity" integer DEFAULT 8,
	"status" text DEFAULT 'upcoming',
	"program" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshop_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" bigint NOT NULL,
	"media_id" integer NOT NULL,
	"display_order" integer DEFAULT 0,
	"caption" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshop_interest" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" bigint,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"age" integer,
	"profession" text,
	"experience" text,
	"goal" text,
	"sample" text,
	"preferred_dates" text,
	"how_heard" text,
	"product_ids" text,
	"gf_entry_id" integer,
	"source_url" text,
	"ip_address" text,
	"status" text DEFAULT 'pending',
	"opt_out" boolean DEFAULT false,
	"opt_out_token" text,
	"opt_out_date" timestamp,
	"smart_mail_sent_at" timestamp,
	"ai_identikit" text,
	"ai_identikit_updated" timestamp,
	"iap_context" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workshop_interest_wp_id_unique" UNIQUE("wp_id"),
	CONSTRAINT "workshop_interest_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workshop_interest_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"interest_id" integer NOT NULL,
	"workshop_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" bigint PRIMARY KEY NOT NULL,
	"media_id" integer,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"capacity" integer DEFAULT 8,
	"price" numeric(10, 2),
	"slug" text,
	"status" text DEFAULT 'upcoming',
	"duration" text,
	"instructor_id" integer,
	"program" jsonb,
	"meta" jsonb,
	"wp_product_id" bigint,
	CONSTRAINT "workshops_slug_unique" UNIQUE("slug"),
	CONSTRAINT "workshops_wp_product_id_unique" UNIQUE("wp_product_id")
);
--> statement-breakpoint
CREATE TABLE "yuki_outstanding" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"invoice_nr" text NOT NULL,
	"invoice_date" timestamp,
	"due_date" timestamp,
	"amount" numeric(10, 2),
	"open_amount" numeric(10, 2),
	"currency" text DEFAULT 'EUR',
	"last_synced" timestamp DEFAULT now()
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
CREATE TABLE "pronunciation_dictionary" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"word" text NOT NULL,
	"phonetic" text NOT NULL,
	"language" text DEFAULT 'nl-BE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "mail_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"uid" bigint NOT NULL,
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
	"account_id" text,
	"category" text NOT NULL,
	"status" text DEFAULT 'active',
	"ai_metadata" jsonb DEFAULT '{}'::jsonb,
	"is_promoted" boolean DEFAULT false,
	"promoted_media_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "academy_tips" ADD CONSTRAINT "academy_tips_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_dialects" ADD CONSTRAINT "actor_dialects_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_videos" ADD CONSTRAINT "actor_videos_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_videos" ADD CONSTRAINT "actor_videos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_reflections" ADD CONSTRAINT "ademing_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_stats" ADD CONSTRAINT "ademing_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ADD CONSTRAINT "ademing_tracks_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_clones" ADD CONSTRAINT "ai_clones_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_queue" ADD CONSTRAINT "approval_queue_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_workshop_edition_id_workshop_editions_id_fk" FOREIGN KEY ("workshop_edition_id") REFERENCES "public"."workshop_editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_push_subscriptions" ADD CONSTRAINT "chat_push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_block_versions" ADD CONSTRAINT "content_block_versions_block_id_content_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."content_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_block_versions" ADD CONSTRAINT "content_block_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_article_id_content_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."content_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_submissions" ADD CONSTRAINT "course_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_submissions" ADD CONSTRAINT "course_submissions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_edition_id_workshop_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."workshop_editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_touchpoints" ADD CONSTRAINT "utm_touchpoints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_touchpoints" ADD CONSTRAINT "utm_touchpoints_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_affinity" ADD CONSTRAINT "voice_affinity_voice_a_id_actors_id_fk" FOREIGN KEY ("voice_a_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_affinity" ADD CONSTRAINT "voice_affinity_voice_b_id_actors_id_fk" FOREIGN KEY ("voice_b_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD CONSTRAINT "voicejar_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_batch_id_voucher_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."voucher_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_editions" ADD CONSTRAINT "workshop_editions_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_editions" ADD CONSTRAINT "workshop_editions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_editions" ADD CONSTRAINT "workshop_editions_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_gallery" ADD CONSTRAINT "workshop_gallery_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_gallery" ADD CONSTRAINT "workshop_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD CONSTRAINT "workshop_interest_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_interest_products" ADD CONSTRAINT "workshop_interest_products_interest_id_workshop_interest_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."workshop_interest"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_interest_products" ADD CONSTRAINT "workshop_interest_products_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_project_id_orders_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_files" ADD CONSTRAINT "vault_files_promoted_media_id_media_id_fk" FOREIGN KEY ("promoted_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uid_account_idx" ON "mail_content" USING btree ("uid","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_id_idx" ON "mail_content" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "account_id_idx" ON "mail_content" USING btree ("account_id");
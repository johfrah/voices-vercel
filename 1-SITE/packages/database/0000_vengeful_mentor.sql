DO $$ BEGIN
 CREATE TYPE "public"."lead_vibe" AS ENUM('cold', 'warm', 'hot', 'burning');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sender_type" AS ENUM('user', 'admin', 'ai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'active', 'live', 'publish', 'rejected', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE "actor_demos" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" integer,
	"actor_id" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"type" text,
	"is_public" boolean DEFAULT true,
	"menu_order" integer DEFAULT 0,
	CONSTRAINT "actor_demos_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE TABLE "actors" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_product_id" integer,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text,
	"gender" text,
	"native_lang" text NOT NULL,
	"country" text,
	"delivery_time" text,
	"extra_langs" text,
	"bio" text,
	"why_voices" text,
	"tagline" text,
	"ai_tags" text,
	"photo_id" integer,
	"logo_id" integer,
	"voice_score" integer DEFAULT 10,
	"price_unpaid" numeric(10, 2),
	"price_online" numeric(10, 2),
	"price_ivr" numeric(10, 2),
	"price_live_regie" numeric(10, 2),
	"dropbox_url" text,
	"status" text DEFAULT 'pending',
	"is_public" boolean DEFAULT false,
	"is_ai" boolean DEFAULT false,
	"elevenlabs_id" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "actors_wp_product_id_unique" UNIQUE("wp_product_id")
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
	"wp_id" integer,
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
	"wp_id" integer,
	"google_event_id" text,
	"user_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'confirmed',
	"reschedule_token" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "appointments_wp_id_unique" UNIQUE("wp_id")
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
	"wp_id" integer,
	"user_id" integer,
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
	"wp_id" integer,
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
	"wp_id" integer,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"status" text DEFAULT 'publish',
	"user_id" integer,
	"featured_image_id" integer,
	"iap_context" jsonb,
	"seo_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "content_articles_wp_id_unique" UNIQUE("wp_id"),
	CONSTRAINT "content_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer,
	"type" text,
	"content" text,
	"settings" jsonb,
	"display_order" integer DEFAULT 0
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
CREATE TABLE "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" integer,
	"category" text,
	"question_nl" text,
	"answer_nl" text,
	"question_fr" text,
	"answer_fr" text,
	"question_en" text,
	"answer_en" text,
	"persona" text,
	"journey_phase" text,
	"is_public" boolean DEFAULT true,
	"internal_notes" text,
	"display_order" integer DEFAULT 0,
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
	"wp_order_id" integer,
	"user_id" integer,
	"total" numeric(10, 2),
	"total_tax" numeric(10, 2),
	"total_profit" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"journey" text NOT NULL,
	"iap_context" jsonb,
	"billing_vat_number" text,
	"yuki_invoice_id" text,
	"dropbox_folder_url" text,
	"internal_notes" text,
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_wp_order_id_unique" UNIQUE("wp_order_id")
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
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_id" integer,
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
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_user_id" integer,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"company_name" text,
	"company_sector" text,
	"company_size" text,
	"vat_number" text,
	"role" text DEFAULT 'guest',
	"customer_type" text,
	"journey_state" text,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"customer_insights" jsonb,
	"activity_log" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
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
CREATE TABLE "voicejar_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"visitor_hash" text,
	"url" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "workshop_interest" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workshop_interest_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" serial PRIMARY KEY NOT NULL,
	"wp_product_id" integer,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"location" text,
	"capacity" integer DEFAULT 8,
	"price" numeric(10, 2),
	"status" text DEFAULT 'upcoming',
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
ALTER TABLE "actor_demos" ADD CONSTRAINT "actor_demos_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_reflections" ADD CONSTRAINT "ademing_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ademing_stats" ADD CONSTRAINT "ademing_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_clones" ADD CONSTRAINT "ai_clones_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_push_subscriptions" ADD CONSTRAINT "chat_push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_article_id_content_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."content_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_submissions" ADD CONSTRAINT "course_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_touchpoints" ADD CONSTRAINT "utm_touchpoints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_touchpoints" ADD CONSTRAINT "utm_touchpoints_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_affinity" ADD CONSTRAINT "voice_affinity_voice_a_id_actors_id_fk" FOREIGN KEY ("voice_a_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_affinity" ADD CONSTRAINT "voice_affinity_voice_b_id_actors_id_fk" FOREIGN KEY ("voice_b_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicejar_sessions" ADD CONSTRAINT "voicejar_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_batch_id_voucher_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."voucher_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
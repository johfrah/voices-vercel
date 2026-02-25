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
CREATE TABLE "workshop_interest_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"interest_id" integer NOT NULL,
	"wp_product_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
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
ALTER TABLE "order_items" ALTER COLUMN "order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "question_de" text;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "answer_de" text;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "helpful_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "not_helpful_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "cta" jsonb;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wp_id" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "photo_id" integer;--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD COLUMN "wp_id" bigint;--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD COLUMN "iap_context" jsonb;--> statement-breakpoint
ALTER TABLE "vault_files" ADD COLUMN "account_id" text;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_interest_products" ADD CONSTRAINT "workshop_interest_products_interest_id_workshop_interest_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."workshop_interest"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD CONSTRAINT "workshop_interest_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_id_idx" ON "mail_content" USING btree ("account_id");--> statement-breakpoint
ALTER TABLE "workshop_interest" ADD CONSTRAINT "workshop_interest_wp_id_unique" UNIQUE("wp_id");
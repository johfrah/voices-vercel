-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create mail_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS "mail_content" (
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
	"iap_context" jsonb DEFAULT '{}',
	"embedding" vector(1536),
	"is_encrypted" boolean DEFAULT true,
	"is_super_private" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add unique indexes
DO $$ BEGIN
 CREATE UNIQUE INDEX IF NOT EXISTS "uid_account_idx" ON "mail_content" ("uid", "account_id");
EXCEPTION
 WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
 CREATE UNIQUE INDEX IF NOT EXISTS "message_id_idx" ON "mail_content" ("message_id");
EXCEPTION
 WHEN duplicate_table THEN null;
END $$;

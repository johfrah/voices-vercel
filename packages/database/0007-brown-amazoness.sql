ALTER TABLE "actor_demos" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "wp_product_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "actors" ALTER COLUMN "native_lang" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ademing_tracks" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "chat_conversations" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "content_articles" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "faq" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "instructors" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "wp_order_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "wp_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wp_user_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "workshops" ALTER COLUMN "wp_product_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "mail_content" ALTER COLUMN "uid" SET DATA TYPE bigint;
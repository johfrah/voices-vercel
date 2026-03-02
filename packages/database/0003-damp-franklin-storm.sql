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
ALTER TABLE "actor_videos" ADD CONSTRAINT "actor_videos_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor_videos" ADD CONSTRAINT "actor_videos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "latitude" numeric(10, 6);--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "longitude" numeric(10, 6);--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "likes_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "images" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_latitude" numeric(10, 6);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_longitude" numeric(10, 6);--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
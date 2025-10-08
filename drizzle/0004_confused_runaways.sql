ALTER TABLE "quiz" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "quiz" ADD COLUMN "name" text;--> statement-breakpoint
UPDATE "quiz" SET "name" = 'Untitled Quiz' WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "name" SET DEFAULT 'Untitled Quiz';--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "score" integer DEFAULT 0 NOT NULL;
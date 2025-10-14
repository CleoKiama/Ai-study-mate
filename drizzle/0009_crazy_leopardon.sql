CREATE TABLE "summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_id" text NOT NULL,
	"external_file_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"model" text NOT NULL,
	"tokens" integer,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summary" ADD CONSTRAINT "summary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summary" ADD CONSTRAINT "summary_file_id_llama_file_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."llama_file"("file_id") ON DELETE cascade ON UPDATE no action;
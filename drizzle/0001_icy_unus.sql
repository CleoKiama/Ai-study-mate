CREATE TABLE "llama_file" (
	"file_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"external_file_id" text NOT NULL,
	"file_name" text,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "llama_file" ADD CONSTRAINT "llama_file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
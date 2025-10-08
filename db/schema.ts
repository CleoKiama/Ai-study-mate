import { pgTable, text, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import type { QuizResult } from "@/app/dashboard/quizzes/utils/quiz-server";

const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
};

export const llamaFile = pgTable("llama_file", {
  // LlamaCloud file UUID
  fileId: text("file_id").primaryKey(),

  // Owner
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),

  // App-controlled identifier set at upload (e.g., `${userId}:${uuid}`)
  externalFileId: text("external_file_id").notNull(),

  // Original filename (optional but useful for UI)
  fileName: text("file_name"),
  ...timestamps,
});

export const quiz = pgTable("quiz", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  quiz: json().$type<QuizResult>().notNull(),
  ...timestamps,
});

import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const llamaFile = pgTable("llama_file", {
  // LlamaCloud file UUID
  fileId: text("file_id").primaryKey(),

  // Owner
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // App-controlled identifier set at upload (e.g., `${userId}:${uuid}`)
  externalFileId: text("external_file_id").notNull(),

  // Original filename (optional but useful for UI)
  fileName: text("file_name"),

  // Simple lifecycle state: uploaded | ingesting | ready | deleted
  status: text("status").notNull().default("uploaded"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

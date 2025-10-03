import { defineConfig } from "drizzle-kit";
import { env } from "@/utils/env.server";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/*",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});

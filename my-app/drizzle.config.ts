import  { defineConfig } from "drizzle-kit";
import { env } from "@/lib/env.mjs";

export default defineConfig ({
  dialect: "sqlite",
  schema: "./lib/db/schema",
  out: "./lib/db/migrations",
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  }
} )
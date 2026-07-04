import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./supabase/migrations",
	dialect: "turso",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
	},
});

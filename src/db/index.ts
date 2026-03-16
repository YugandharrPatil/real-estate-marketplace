/**
 * Drizzle ORM connection — used ONLY for migrations (drizzle-kit).
 * All runtime database queries should use the Supabase SDK instead,
 * so that Row Level Security (RLS) policies are enforced.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

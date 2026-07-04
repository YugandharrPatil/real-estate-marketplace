import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const client = createClient({
	url: connectionString,
	authToken: authToken,
});

export const db = drizzle(client, { schema });

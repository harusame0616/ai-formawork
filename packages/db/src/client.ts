import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "./schema";

const globalForDb = global as unknown as {
	db: PostgresJsDatabase<typeof schema>;
};

const client = postgres(env.DATABASE_URL);

export const db = globalForDb.db || drizzle(client, { schema });

// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;

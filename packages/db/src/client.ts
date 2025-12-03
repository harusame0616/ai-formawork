import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as v from "valibot";
import { schemaName } from "./pgschema";
import * as schema from "./schema";

export const databaseUrl = v.parse(
	v.pipe(
		v.string("databaseUrl は文字列である必要があります"),
		v.url("databaseUrl は URL 形式である必要があります"),
	),
	// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
	process.env["DATABASE_URL"],
);

const globalForDb = global as unknown as {
	db: PostgresJsDatabase<typeof schema>;
};

const client = postgres(`${databaseUrl}?search_path=${schemaName}`);

export const db = globalForDb.db || drizzle(client, { schema });

// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;

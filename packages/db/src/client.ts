import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as v from "valibot";
import { schemaName } from "./pgschema";
import * as schema from "./schema";

export const databaseUrl = new URL(
	v.parse(
		v.pipe(
			v.string("databaseUrl は文字列である必要があります"),
			v.url("databaseUrl は URL 形式である必要があります"),
		),
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		process.env["DATABASE_URL"],
	),
);

console.log("drizzle client config", {
	databaseHost: databaseUrl.hostname,
	databaseName: databaseUrl.pathname,
	databasePort: databaseUrl.port,
});

const globalForDb = global as unknown as {
	db: PostgresJsDatabase<typeof schema>;
};

const client = postgres(databaseUrl.toString());

export const db = globalForDb.db || drizzle(client, { schema });
await db.execute(sql.raw(`SET search_path TO ${schemaName}`));

// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
if (process.env["NODE_ENV"] !== "production") globalForDb.db = db;

export type DbClient = typeof db;

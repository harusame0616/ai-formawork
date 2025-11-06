import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getConnectionString() {
	const connectionString = process.env["DATABASE_URL"];
	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is not set");
	}
	return connectionString;
}

export function createDbClient() {
	const connectionString = getConnectionString();
	const client = postgres(connectionString);
	return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;

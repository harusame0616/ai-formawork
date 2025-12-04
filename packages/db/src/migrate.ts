import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { databaseUrl } from "./client";
import { schemaName } from "./pgschema";

const client = postgres(databaseUrl.toString());

const db = drizzle(client);

async function main() {
	console.log("Running migrations...", {
		databaseHost: databaseUrl.hostname,
		databaseName: databaseUrl.pathname,
		databasePort: databaseUrl.port,
		schemaName,
	});

	await db.execute(sql.raw(`SET search_path TO ${schemaName}`));

	await migrate(db, {
		migrationsFolder: "./drizzle",
		migrationsSchema: schemaName,
	});

	console.log("Migrations completed successfully");
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Migration failed:", error);
		process.exit(1);
	});

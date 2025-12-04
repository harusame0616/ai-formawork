import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as v from "valibot";
import { schemaName } from "./pgschema";

const databaseUrl = new URL(
	v.parse(
		v.pipe(
			v.string("databaseUrl は文字列である必要があります"),
			v.url("databaseUrl は URL 形式である必要があります"),
		),
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		process.env["DATABASE_URL"],
	),
);

console.log("migrate config", {
	databaseHost: databaseUrl.hostname,
	databaseName: databaseUrl.pathname,
	databasePort: databaseUrl.port,
	schemaName,
});

const client = postgres(databaseUrl.toString(), {
	connection: {
		search_path: schemaName,
	},
	max: 1,
});

const db = drizzle(client);

async function main() {
	console.log("Running migrations...");
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

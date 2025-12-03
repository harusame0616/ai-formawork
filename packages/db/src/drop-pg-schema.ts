import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	const result = await db.execute(
		sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`),
	);
	console.log(result);
}

await main()
	.then(() => process.exit())
	.catch((error) => console.log(error));

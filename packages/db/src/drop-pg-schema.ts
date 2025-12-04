import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log("Drop postgresql schema");
	const result = await db.execute(
		sql.raw(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`),
	);
	console.log("result", { ...result });
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});

import { sql } from "drizzle-orm";
import { db } from "./client";
import { schemaName } from "./pgschema";

async function main() {
	console.log(`Create postgresql schema: ${schemaName}`);
	const result = await db.execute(
		sql.raw(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`),
	);
	console.log("result", { ...result });
}

await main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});

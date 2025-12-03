import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./src/client";
import { schemaName } from "./src/pgschema";

export default defineConfig({
	breakpoints: false,
	dbCredentials: {
		url: `${databaseUrl}?search_path=${schemaName}`,
	},
	dialect: "postgresql",
	migrations: {
		schema: schemaName,
	},
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

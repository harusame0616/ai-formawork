import { defineConfig } from "drizzle-kit";
import * as v from "valibot";
import { schemaName } from "./src/pgschema";

// drizzle-kit generate / studio 用の設定（ローカル開発用）
const databaseUrl = v.parse(
	v.pipe(
		v.string("DATABASE_URL は文字列である必要があります"),
		v.nonEmpty("DATABASE_URL は1文字以上である必要があります"),
		v.url("DATABASE_URL は URL である必要があります"),
	),
	// biome-ignore lint/complexity/useLiteralKeys: ts4111
	process.env["DATABASE_URL"],
);

export default defineConfig({
	breakpoints: false,
	dbCredentials: {
		url: databaseUrl,
	},
	dialect: "postgresql",
	migrations: {
		schema: schemaName,
	},
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

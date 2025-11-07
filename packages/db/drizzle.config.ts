import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: drizzle-kit requires DATABASE_URL to be set
		url: process.env.DATABASE_URL!,
	},
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

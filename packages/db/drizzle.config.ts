import { defineConfig } from "drizzle-kit";

// マイグレーションは migrate.ts によって実施するため、 generation に必要な項目だけ設定
export default defineConfig({
	breakpoints: false,
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./src/schema/index.ts",
});

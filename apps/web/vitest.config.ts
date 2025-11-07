import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": "/",
		},
	},
	test: {
		environment: "happy-dom",
		exclude: ["**/node_modules/**", "**/e2e/**"],
		globals: true,
		include: ["**/*.test.{ts,tsx}"],
		setupFiles: ["./vitest.setup.ts"],
	},
});

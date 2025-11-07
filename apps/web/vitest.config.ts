import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./"),
		},
	},
	test: {
		environment: "happy-dom",
		exclude: ["node_modules", "dist", "e2e/**"],
		include: ["**/*.{test,spec}.{ts,tsx}"],
		setupFiles: [],
	},
});

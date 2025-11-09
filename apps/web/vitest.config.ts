import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	optimizeDeps: {
		exclude: ["playwright", "playwright-core", "@playwright/test"],
	},
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [
				{
					browser: "chromium",
				},
			],
			provider: playwright(),
		},
		exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/.next/**"],
		globals: true,
		include: ["**/*.test.{ts,tsx}"],
		testTimeout: 30000,
	},
});

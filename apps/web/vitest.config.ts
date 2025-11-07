import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	esbuild: false, // esbuild を無効化して SWC を使用
	optimizeDeps: {
		include: [
			"@testing-library/react",
			"@testing-library/user-event",
			"react-hook-form",
			"valibot",
			"@hookform/resolvers",
		],
	},
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
			"@repo/supabase": path.resolve(__dirname, "../../packages/supabase/src"),
			"@workspace/db": path.resolve(__dirname, "../../packages/db/src"),
			"@workspace/ui": path.resolve(__dirname, "../../packages/ui/src"),
		},
	},
	ssr: {
		noExternal: [
			"@workspace/ui",
			"@workspace/db",
			"@repo/supabase",
			"@radix-ui/react-slot",
			"class-variance-authority",
			"clsx",
			"tailwind-merge",
		],
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [{ browser: "chromium" }],
			provider: playwright(),
		},
		exclude: ["**/node_modules/**", "**/e2e/**"],
		globals: true,
		include: ["**/*.test.{ts,tsx}"],
	},
});

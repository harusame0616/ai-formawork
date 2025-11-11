import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
	test: {
		projects: [
			{
				define: {
					"process.env": {},
				},
				optimizeDeps: {
					// 以下のエラー対策	（cspell:disable-next-line）
					// [vitest] Vite unexpectedly reloaded a test. This may cause tests to fail, lead to flaky behaviour or duplicated test runs.
					// For a stable experience, please add mentioned dependencies to your config's `optimizeDeps.include` field manually.
					include: [
						"react/jsx-dev-runtime",
						"vitest-browser-react",
						"next/navigation",
						"next/link",
						"lucide-react",
						"react",
						"valibot",
						"@hookform/resolvers/valibot",
						"react-hook-form",
						"@radix-ui/react-slot",
						"@radix-ui/react-dialog",
						"class-variance-authority",
						"clsx",
						"tailwind-merge",
					],
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
					exclude: [
						"**/node_modules/**",
						"**/dist/**",
						"**/e2e/**",
						"**/.next/**",
					],
					include: ["**/*.browser.test.{ts,tsx}"],
					name: "browser",
					testTimeout: 1000,
				},
			},
			{
				test: {
					environment: "node",
					exclude: [
						"**/node_modules/**",
						"**/dist/**",
						"**/e2e/**",
						"**/.next/**",
					],
					include: ["**/*.small.*.test.{ts,tsx}"],
					name: "small",
				},
			},
			{
				test: {
					env: {
						DATABASE_URL:
							"postgresql://postgres:postgres@127.0.0.1:62022/postgres",
						NEXT_PUBLIC_SUPABASE_ANON_KEY /* cspell:disable-next-line */:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
						NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:62021",
						SUPABASE_SERVICE_ROLE_KEY /* cspell:disable-next-line */:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
						SUPABASE_URL: "http://127.0.0.1:62021",
					},
					environment: "node",
					exclude: [
						"**/node_modules/**",
						"**/dist/**",
						"**/e2e/**",
						"**/.next/**",
					],
					include: ["**/*.medium.*.test.{ts,tsx}"],
					name: "medium",
				},
			},
			{
				test: {
					env: {
						DATABASE_URL:
							"postgresql://postgres:postgres@127.0.0.1:62022/postgres",
						NEXT_PUBLIC_SUPABASE_ANON_KEY /* cspell:disable-next-line */:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
						NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:62021",
						SUPABASE_SERVICE_ROLE_KEY /* cspell:disable-next-line */:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
						SUPABASE_URL: "http://127.0.0.1:62021",
					},
					environment: "node",
					exclude: [
						"**/node_modules/**",
						"**/dist/**",
						"**/e2e/**",
						"**/.next/**",
					],
					include: ["**/*.server.test.{ts,tsx}"],
					name: "server",
				},
			},
		],
	},
});

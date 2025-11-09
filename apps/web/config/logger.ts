import * as v from "valibot";

const envSchema = v.object({
	VERCEL_DEPLOYMENT_ID: v.optional(v.string()),
	VERCEL_GIT_COMMIT_SHA: v.optional(v.string()),
});

export function getLoggerConfig() {
	const parsed = v.parse(envSchema, {
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		VERCEL_DEPLOYMENT_ID: process.env["VERCEL_DEPLOYMENT_ID"],
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		VERCEL_GIT_COMMIT_SHA: process.env["VERCEL_GIT_COMMIT_SHA"],
	});

	return {
		deploymentId: parsed.VERCEL_DEPLOYMENT_ID,
		gitCommitSha: parsed.VERCEL_GIT_COMMIT_SHA,
	};
}

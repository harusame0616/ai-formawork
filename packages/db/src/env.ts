import * as v from "valibot";

const envSchema = v.object({
	DATABASE_URL: v.pipe(
		v.string(),
		v.nonEmpty("DATABASE_URL is required"),
		v.url("DATABASE_URL must be a valid URL"),
	),
});

function validateEnv() {
	const result = v.safeParse(envSchema, process.env);

	if (!result.success) {
		const errors = result.issues.map((issue) => {
			const path = issue.path?.map((p) => p.key).join(".") || "unknown";
			return `${path}: ${issue.message}`;
		});

		throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
	}

	return result.output;
}

export const env = validateEnv();

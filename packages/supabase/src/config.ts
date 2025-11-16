import * as v from "valibot";

const supabasePublicConfigSchema = v.object({
	anonKey: v.pipe(
		v.string("NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
		v.nonEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty"),
	),
	url: v.pipe(
		v.string("NEXT_PUBLIC_SUPABASE_URL is required"),
		v.nonEmpty("NEXT_PUBLIC_SUPABASE_URL must not be empty"),
		v.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
	),
});

const supabasePrivateConfigSchema = v.object({
	serviceRoleKey: v.pipe(
		v.string("SUPABASE_SERVICE_ROLE_KEY is required"),
		v.nonEmpty("SUPABASE_SERVICE_ROLE_KEY must not be empty"),
	),
	url: v.pipe(
		v.string("NEXT_PUBLIC_SUPABASE_URL is required"),
		v.nonEmpty("NEXT_PUBLIC_SUPABASE_URL must not be empty"),
		v.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
	),
});

type SupabasePublicConfig = v.InferOutput<typeof supabasePublicConfigSchema>;
type SupabasePrivateConfig = v.InferOutput<typeof supabasePrivateConfigSchema>;

export function getSupabasePublicConfig(): SupabasePublicConfig {
	return v.parse(supabasePublicConfigSchema, {
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		anonKey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		url: process.env["NEXT_PUBLIC_SUPABASE_URL"],
	});
}

export function getSupabasePrivateConfig(): SupabasePrivateConfig {
	return v.parse(supabasePrivateConfigSchema, {
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		serviceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"],
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		url: process.env["NEXT_PUBLIC_SUPABASE_URL"],
	});
}

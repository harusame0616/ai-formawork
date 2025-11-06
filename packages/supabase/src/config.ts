import * as v from "valibot";

const supabasePrivateConfigSchema = v.object({
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

type SupabasePrivateConfig = v.InferOutput<typeof supabasePrivateConfigSchema>;

export function getSupabasePrivateConfig(): SupabasePrivateConfig {
	return v.parse(supabasePrivateConfigSchema, {
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		anonKey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		url: process.env["NEXT_PUBLIC_SUPABASE_URL"],
	});
}

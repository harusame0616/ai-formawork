import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserStaffId(
	supabase: SupabaseClient,
): Promise<string | null> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	// biome-ignore lint: ts4111
	const staffId = user.app_metadata?.["staffId"] as string | undefined;

	return staffId ?? null;
}

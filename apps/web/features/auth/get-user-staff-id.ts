import { createClient } from "@repo/supabase/nextjs/server";

export async function getUserStaffId(): Promise<string | null> {
	const supabase = await createClient();

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

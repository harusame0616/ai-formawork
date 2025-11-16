import type { SupabaseClient } from "@supabase/supabase-js";

const UserRole = {
	Admin: "admin",
	User: "user",
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return UserRole.User;
	}

	// biome-ignore lint: ts4111
	const role = user.app_metadata?.["role"] as string | undefined;

	switch (role) {
		case UserRole.Admin:
			return UserRole.Admin;
		case UserRole.User:
		case undefined:
			return UserRole.User;
		default:
			throw new Error("不明なロールです。");
	}
}

export { UserRole };

import { createClient } from "@repo/supabase/nextjs/server";

export const UserRole = {
	Admin: "admin",
	User: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export async function getUserRole(): Promise<UserRole> {
	const supabase = await createClient();

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

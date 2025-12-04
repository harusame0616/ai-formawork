import { createAdminClient } from "@repo/supabase/admin";

type VerifyTokenResult = {
	userId: string;
	email: string | undefined;
} | null;

export async function verifySupabaseToken(
	token: string,
): Promise<VerifyTokenResult> {
	const supabase = createAdminClient();

	const { data, error } = await supabase.auth.getUser(token);

	if (error || !data.user) {
		return null;
	}

	return {
		email: data.user.email,
		userId: data.user.id,
	};
}

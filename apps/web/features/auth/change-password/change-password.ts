import { fail, type Result, succeed } from "@harusame0616/result";
import { createClient } from "@repo/supabase/nextjs/server";

const SessionError = "セッションが無効です。再度ログインしてください" as const;
const CurrentPasswordError = "現在のパスワードが正しくありません" as const;
const UpdateError = "パスワードの更新に失敗しました" as const;

type ChangePasswordError =
	| typeof SessionError
	| typeof CurrentPasswordError
	| typeof UpdateError;

export async function changePassword({
	currentPassword,
	newPassword,
}: {
	currentPassword: string;
	newPassword: string;
}): Promise<Result<void, ChangePasswordError>> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user?.email) {
		return fail(SessionError);
	}

	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: currentPassword,
	});

	if (signInError) {
		return fail(CurrentPasswordError);
	}

	const { error: updateError } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (updateError) {
		return fail(UpdateError);
	}

	return succeed();
}

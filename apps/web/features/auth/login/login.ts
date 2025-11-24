import { fail, type Result, succeed } from "@harusame0616/result";
import { createClient } from "@repo/supabase/nextjs/server";
import type * as v from "valibot";
import type { loginSchema } from "../schema";

type LoginParams = v.InferOutput<typeof loginSchema>;

const LoginErrorMessage =
	"ログインできませんでした。メールアドレス・パスワードを確認し、解決しない場合は時間をおくか管理者にお問い合わせください。" as const;

export type LoginErrorMessage = typeof LoginErrorMessage;

export async function login(
	params: LoginParams,
): Promise<Result<void, LoginErrorMessage>> {
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email: params.username,
		password: params.password,
	});

	if (error) {
		return fail(LoginErrorMessage);
	}

	return succeed();
}

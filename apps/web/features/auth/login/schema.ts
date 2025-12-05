import * as v from "valibot";

/**
 * ユーザー名(メールアドレス)のバリデーションルール
 * RFC 5321 準拠で254文字以下
 */
const usernameSchema = v.pipe(
	v.string("メールアドレスを入力してください"),
	v.nonEmpty("メールアドレスを入力してください"),
	v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
	v.email("有効なメールアドレスを入力してください"),
);

// ログイン時はパスワードの条件が漏洩しないように詳細なバリデーションを行わない
// ただし DoS 攻撃対策として最大文字数は制限する
const loginPasswordSchema = v.pipe(
	v.string("パスワードを入力してください"),
	v.nonEmpty("パスワードを入力してください"),
	v.maxLength(64, "パスワードは64文字以内で入力してください"),
);

export const loginSchema = v.object({
	password: loginPasswordSchema,
	username: usernameSchema,
});

export type LoginParams = v.InferOutput<typeof loginSchema>;

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

/**
 * パスワードのバリデーションルール:
 * - 8文字以上64文字以下
 * - 英小文字を含む
 * - 英大文字を含む
 * - 数字を含む
 * - 記号を含む
 */
const _passwordSchema = v.pipe(
	v.string("パスワードを入力してください"),
	v.nonEmpty("パスワードを入力してください"),
	v.minLength(8, "パスワードは8文字以上である必要があります"),
	v.maxLength(64, "パスワードは64文字以下である必要があります"),
	v.regex(/[a-z]/, "パスワードには英小文字を含む必要があります"),
	v.regex(/[A-Z]/, "パスワードには英大文字を含む必要があります"),
	v.regex(/[0-9]/, "パスワードには数字を含む必要があります"),
	v.regex(
		/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/,
		"パスワードには記号を含む必要があります",
	),
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

export type LoginSchema = v.InferOutput<typeof loginSchema>;

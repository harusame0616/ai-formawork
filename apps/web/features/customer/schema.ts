import * as v from "valibot";

/**
 * 顧客名のバリデーションルール
 * - 必須
 * - 最大100文字
 */
const customerNameSchema = v.pipe(
	v.string("顧客名を入力してください"),
	v.nonEmpty("顧客名を入力してください"),
	v.maxLength(100, "顧客名は100文字以内で入力してください"),
);

/**
 * メールアドレスのバリデーションルール
 * RFC 5321 準拠で254文字以下
 */
const customerEmailSchema = v.pipe(
	v.string("メールアドレスを入力してください"),
	v.nonEmpty("メールアドレスを入力してください"),
	v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
	v.email("有効なメールアドレスを入力してください"),
);

export const customerFormSchema = v.object({
	email: customerEmailSchema,
	name: customerNameSchema,
});

export type CustomerFormSchema = v.InferOutput<typeof customerFormSchema>;

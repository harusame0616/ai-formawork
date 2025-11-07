import * as v from "valibot";

/**
 * 顧客名のバリデーションルール
 */
const nameSchema = v.pipe(
	v.string("顧客名を入力してください"),
	v.nonEmpty("顧客名を入力してください"),
	v.maxLength(255, "顧客名は255文字以下である必要があります"),
);

/**
 * メールアドレスのバリデーションルール
 */
const emailSchema = v.pipe(
	v.string("メールアドレスを入力してください"),
	v.nonEmpty("メールアドレスを入力してください"),
	v.email("有効なメールアドレスを入力してください"),
	v.maxLength(255, "メールアドレスは255文字以下である必要があります"),
);

/**
 * 顧客作成フォームのスキーマ
 */
export const createCustomerSchema = v.object({
	email: emailSchema,
	name: nameSchema,
});

export type CreateCustomerSchema = v.InferOutput<typeof createCustomerSchema>;

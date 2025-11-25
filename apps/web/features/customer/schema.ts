import * as v from "valibot";

// 顧客登録用の定数
const CUSTOMER_NAME_MAX_LENGTH = 24;
const CUSTOMER_EMAIL_MAX_LENGTH = 254;
const CUSTOMER_PHONE_MAX_LENGTH = 20;

export const emailSchema = v.union([
	v.literal(""),
	v.pipe(
		v.string(),
		v.email("正しいメールアドレス形式で入力してください"),
		v.maxLength(
			CUSTOMER_EMAIL_MAX_LENGTH,
			`メールアドレスは${CUSTOMER_EMAIL_MAX_LENGTH}文字以内で入力してください`,
		),
	),
]);
export const nameSchema = v.pipe(
	v.string("名前を入力してください"),
	v.minLength(1, "名前を入力してください"),
	v.maxLength(
		CUSTOMER_NAME_MAX_LENGTH,
		`名前は${CUSTOMER_NAME_MAX_LENGTH}文字以内で入力してください`,
	),
);
export const phoneSchema = v.union([
	v.literal(""),
	v.pipe(
		v.string(),
		v.transform((value) => value.replace(/-/g, "")),
		v.regex(/^\d*$/, "電話番号は数字のみで入力してください"),
		v.maxLength(
			CUSTOMER_PHONE_MAX_LENGTH,
			`電話番号は${CUSTOMER_PHONE_MAX_LENGTH}文字以内で入力してください`,
		),
	),
]);

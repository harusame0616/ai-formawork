import * as v from "valibot";

export const changePasswordSchema = v.pipe(
	v.object({
		currentPassword: v.pipe(
			v.string("現在のパスワードを入力してください"),
			v.minLength(1, "現在のパスワードを入力してください"),
			v.maxLength(64, "パスワードは64文字以内で入力してください"),
		),
		newPassword: v.pipe(
			v.string("新しいパスワードを入力してください"),
			v.minLength(1, "新しいパスワードを入力してください"),
			v.minLength(8, "パスワードは8文字以上で入力してください"),
			v.maxLength(64, "パスワードは64文字以内で入力してください"),
		),
	}),
	v.forward(
		v.partialCheck(
			[["currentPassword"], ["newPassword"]],
			(input) => input.currentPassword !== input.newPassword,
			"新しいパスワードは現在のパスワードと異なるものを入力してください",
		),
		["newPassword"],
	),
);

export type ChangePasswordParams = v.InferOutput<typeof changePasswordSchema>;

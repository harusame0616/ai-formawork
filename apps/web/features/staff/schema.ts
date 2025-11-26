import * as v from "valibot";
import { UserRole } from "@/features/auth/user/role";

export const staffNameSchema = v.pipe(
	v.string("名前を入力してください"),
	v.minLength(1, "名前を入力してください"),
	v.maxLength(24, "名前は24文字以内で入力してください"),
);

export const staffEmailSchema = v.pipe(
	v.string("メールアドレスを入力してください"),
	v.minLength(1, "メールアドレスを入力してください"),
	v.email("正しいメールアドレス形式で入力してください"),
	v.maxLength(254, "メールアドレスは254文字以内で入力してください"),
);

export const staffPasswordSchema = v.pipe(
	v.string("パスワードを入力してください"),
	v.minLength(1, "パスワードを入力してください"),
	v.minLength(8, "パスワードは8文字以上で入力してください"),
	v.maxLength(128, "パスワードは128文字以内で入力してください"),
);

export const staffRoleSchema = v.picklist(
	[UserRole.Admin, UserRole.User],
	"ロールを選択してください",
);

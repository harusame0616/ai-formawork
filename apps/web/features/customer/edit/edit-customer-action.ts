"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { tagByCustomerId } from "@/features/customer/tag";
import { editCustomer } from "./edit-customer";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const CUSTOMER_NOT_FOUND_ERROR_MESSAGE =
	"指定された顧客が見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type EditCustomerActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof CUSTOMER_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const editCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
	email: v.nullable(
		v.pipe(
			v.string(),
			v.minLength(1, "メールアドレスを入力してください"),
			v.email("有効なメールアドレスを入力してください"),
			v.maxLength(255, "メールアドレスは255文字以内で入力してください"),
		),
	),
	name: v.pipe(
		v.string(),
		v.minLength(1, "顧客名を入力してください"),
		v.maxLength(255, "顧客名は255文字以内で入力してください"),
	),
	phone: v.nullable(
		v.pipe(
			v.string(),
			v.minLength(1, "電話番号を入力してください"),
			v.maxLength(20, "電話番号は20文字以内で入力してください"),
		),
	),
});

type EditCustomerInput = v.InferInput<typeof editCustomerSchema>;

export async function editCustomerAction(
	params: EditCustomerInput,
): Promise<Result<undefined, EditCustomerActionErrorMessage>> {
	const logger = await getLogger("editCustomerAction");
	logger.info("editCustomerAction を実行", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(editCustomerSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("バリデーション失敗", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { customerId, email, name, phone } = paramsParseResult.output;

	// 認証情報の取得
	const userId = await getUserStaffId();
	if (!userId) {
		logger.warn("認証されていないアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	// 更新処理を実行
	const result = await editCustomer({
		customerId,
		email,
		name,
		phone,
	});

	if (!result.success) {
		return result;
	}

	// キャッシュの更新
	updateTag(tagByCustomerId(customerId));

	return succeed();
}

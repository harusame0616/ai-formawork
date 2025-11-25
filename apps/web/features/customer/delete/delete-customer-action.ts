"use server";

import { fail, type Result } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { getUserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { CustomerTag } from "@/features/customer/tag";
import { deleteCustomer } from "./delete-customer";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const CUSTOMER_NOT_FOUND_ERROR_MESSAGE =
	"指定された顧客が見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type DeleteCustomerActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof CUSTOMER_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const deleteCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
});

type DeleteCustomerInput = v.InferInput<typeof deleteCustomerSchema>;

export async function deleteCustomerAction(
	params: DeleteCustomerInput,
): Promise<Result<undefined, DeleteCustomerActionErrorMessage>> {
	const logger = await getLogger("deleteCustomerAction");
	logger.info("deleteCustomerAction を実行", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(deleteCustomerSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("バリデーション失敗", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { customerId } = paramsParseResult.output;

	// 認証情報の取得
	const userId = await getUserStaffId();
	if (!userId) {
		logger.warn("認証されていないアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	const role = await getUserRole();
	if (role !== "admin") {
		logger.warn("権限がないアクセス", {
			customerId,
			event: EventType.AuthorizationError,
		});
		return fail(FORBIDDEN_ERROR_MESSAGE);
	}

	// 削除処理を実行
	const result = await deleteCustomer({
		customerId,
	});

	if (!result.success) {
		return result;
	}

	// キャッシュの更新
	updateTag(CustomerTag.crud);
	updateTag(CustomerTag.NoteCrud(customerId));

	redirect("/customers", RedirectType.replace);
}

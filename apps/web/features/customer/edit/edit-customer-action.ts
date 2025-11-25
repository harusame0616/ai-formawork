"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { tagByCustomerId } from "@/features/customer/tag";
import { type EditCustomerErrorMessage, editCustomer } from "./edit-customer";
import { type EditCustomerParams, parseEditCustomerParams } from "./schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type EditCustomerActionErrorMessage =
	| EditCustomerErrorMessage
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

export async function editCustomerAction(
	params: EditCustomerParams,
): Promise<Result<{ customerId: string }, EditCustomerActionErrorMessage>> {
	const logger = await getLogger("editCustomerAction");
	logger.info("editCustomerAction を実行", {
		params,
	});

	const parsedParams = parseEditCustomerParams(params);
	if (!parsedParams.success) {
		logger.warn("バリデーション失敗", {
			error: parsedParams.error,
			event: EventType.InputValidationError,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const userId = await getUserStaffId();
	if (!userId) {
		logger.warn("認証されていないアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	try {
		const result = await editCustomer(parsedParams.data);
		if (!result.success) {
			return result;
		}

		updateTag(tagByCustomerId(parsedParams.data.customerId));
		return succeed({ customerId: parsedParams.data.customerId });
	} catch (error) {
		logger.error("顧客編集中に予期しないエラーが発生", {
			action: "edit-customer",
			error,
		});

		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import { CustomerTag, tagByCustomerId } from "../tag";
import { registerCustomer } from "./register-customer";
import {
	parseRegisterCustomerParams,
	type RegisterCustomerParams,
} from "./schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

export async function registerCustomerAction(
	params: RegisterCustomerParams,
): Promise<
	Result<
		{ customerId: string },
		typeof INTERNAL_SERVER_ERROR_MESSAGE | typeof INVALID_INPUT_ERROR_MESSAGE
	>
> {
	const logger = await getLogger("registerCustomerAction");
	logger.info("registerCustomerAction を実行", { params });

	const parsedParams = parseRegisterCustomerParams(params);
	if (!parsedParams.success) {
		logger.warn("バリデーション失敗", {
			event: EventType.InputValidationError,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	try {
		const {
			data: { customerId },
		} = await registerCustomer(parsedParams.data);

		logger.info("顧客登録に成功", {
			action: "register-customer",
			customerId,
		});

		updateTag(CustomerTag.crud);
		updateTag(tagByCustomerId(customerId));
		return succeed({ customerId });
	} catch (error) {
		logger.error("顧客登録中に予期しないエラーが発生", {
			action: "register-customer",
			error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

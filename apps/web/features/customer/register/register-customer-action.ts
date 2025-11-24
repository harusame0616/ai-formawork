"use server";

import { fail, type Result } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { generateUniqueId } from "@/libs/generate-unique-id";
import { type RegisterCustomerInput, registerCustomerSchema } from "../schema";
import { CustomerTag, tagByCustomerId } from "../tag";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type RegisterCustomerActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

export async function registerCustomerAction(
	params: RegisterCustomerInput,
): Promise<Result<never, RegisterCustomerActionErrorMessage>> {
	const logger = await getLogger("registerCustomerAction");
	logger.info("execute registerCustomerAction", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(registerCustomerSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("Validation failed", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { name, email, phone } = paramsParseResult.output;

	const customerId = generateUniqueId();

	try {
		// 顧客の登録
		await db.insert(customersTable).values({
			customerId,
			email: email || null,
			name,
			phone: phone || null,
		});

		logger.info("Customer registered successfully", {
			action: "register-customer",
			customerId,
		});

		updateTag(CustomerTag.crud);
		updateTag(tagByCustomerId(customerId));
	} catch (error) {
		logger.error("Failed to register customer", {
			action: "register-customer",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}

	// 顧客詳細ページへリダイレクト
	redirect(`/customers/${customerId}`);
}

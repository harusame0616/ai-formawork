"use server";

import { fail, type Result } from "@harusame0616/result";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import {
	type CreateCustomerErrorMessage,
	createCustomer,
	type EmailDuplicateErrorMessage,
} from "../../../features/customer/create-customer";
import {
	type CreateCustomerSchema,
	createCustomerSchema,
} from "../../../features/customer/schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;

type CreateCustomerActionErrorMessage =
	| CreateCustomerErrorMessage
	| EmailDuplicateErrorMessage
	| typeof INVALID_INPUT_ERROR_MESSAGE;

export async function createCustomerAction(
	params: CreateCustomerSchema,
): Promise<Result<never, CreateCustomerActionErrorMessage>> {
	const paramsParseResult = v.safeParse(createCustomerSchema, params);
	if (!paramsParseResult.success) {
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	// 顧客作成処理
	const createResult = await createCustomer(paramsParseResult.output);

	if (!createResult.success) {
		return fail(createResult.error);
	}

	redirect("/customers", RedirectType.replace);
}

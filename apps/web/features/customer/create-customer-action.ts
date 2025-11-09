"use server";

import { fail, type Result } from "@harusame0616/result";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import {
	type CreateCustomerErrorMessage,
	createCustomer,
} from "./create-customer";
import { type CustomerFormSchema, customerFormSchema } from "./schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;

type CreateCustomerActionErrorMessage =
	| CreateCustomerErrorMessage
	| typeof INVALID_INPUT_ERROR_MESSAGE;

export async function createCustomerAction(
	params: CustomerFormSchema,
): Promise<Result<never, CreateCustomerActionErrorMessage>> {
	const paramsParseResult = v.safeParse(customerFormSchema, params);
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

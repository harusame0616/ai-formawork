"use server";

import { fail, type Result } from "@harusame0616/result";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { createCustomer } from "../../../features/customer/create-customer";
import {
	type CustomerFormSchema,
	customerFormSchema,
} from "../../../features/customer/schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const EMAIL_ALREADY_EXISTS_ERROR_MESSAGE =
	"このメールアドレスは既に登録されています" as const;
const UNKNOWN_ERROR_MESSAGE =
	"予期しないエラーが発生しました。時間をおいて再度お試しください" as const;

type CreateCustomerActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof EMAIL_ALREADY_EXISTS_ERROR_MESSAGE
	| typeof UNKNOWN_ERROR_MESSAGE;

export async function createCustomerAction(
	params: CustomerFormSchema,
): Promise<Result<never, CreateCustomerActionErrorMessage>> {
	const paramsParseResult = v.safeParse(customerFormSchema, params);
	if (!paramsParseResult.success) {
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	try {
		await createCustomer(paramsParseResult.output);
	} catch (error) {
		// メールアドレス重複エラー
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return fail(EMAIL_ALREADY_EXISTS_ERROR_MESSAGE);
		}
		return fail(UNKNOWN_ERROR_MESSAGE);
	}

	redirect("/customers", RedirectType.replace);
}

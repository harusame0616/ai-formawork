"use server";

import { fail, type Result } from "@harusame0616/result";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import {
	type CustomerFormSchema,
	customerFormSchema,
} from "../../../../features/customer/schema";
import { updateCustomer } from "../../../../features/customer/update-customer";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const EMAIL_ALREADY_EXISTS_ERROR_MESSAGE =
	"このメールアドレスは既に登録されています" as const;
const UNKNOWN_ERROR_MESSAGE =
	"予期しないエラーが発生しました。時間をおいて再度お試しください" as const;

type UpdateCustomerActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof EMAIL_ALREADY_EXISTS_ERROR_MESSAGE
	| typeof UNKNOWN_ERROR_MESSAGE;

type UpdateCustomerActionParams = CustomerFormSchema & {
	customerId: string;
};

export async function updateCustomerAction(
	params: UpdateCustomerActionParams,
): Promise<Result<never, UpdateCustomerActionErrorMessage>> {
	const paramsParseResult = v.safeParse(
		v.object({
			customerId: v.pipe(v.string(), v.uuid()),
			...customerFormSchema.entries,
		}),
		params,
	);

	if (!paramsParseResult.success) {
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	try {
		await updateCustomer({
			customerId: paramsParseResult.output.customerId,
			email: paramsParseResult.output.email,
			name: paramsParseResult.output.name,
		});
	} catch (error) {
		// メールアドレス重複エラー
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return fail(EMAIL_ALREADY_EXISTS_ERROR_MESSAGE);
		}
		return fail(UNKNOWN_ERROR_MESSAGE);
	}

	redirect("/customers", RedirectType.replace);
}

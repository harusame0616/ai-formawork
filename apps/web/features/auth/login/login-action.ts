"use server";

import { fail, type Result } from "@harusame0616/result";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { type LoginErrorMessage, login } from "@/features/auth/login/login";
import { type LoginSchema, loginSchema } from "@/features/auth/schema";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;

type LoginActionErrorMessage =
	| LoginErrorMessage
	| typeof INVALID_INPUT_ERROR_MESSAGE;

export async function loginAction(
	params: LoginSchema,
): Promise<Result<never, LoginActionErrorMessage>> {
	const paramsParseResult = v.safeParse(loginSchema, params);
	if (!paramsParseResult.success) {
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	// ログイン処理
	const loginResult = await login(paramsParseResult.output);

	if (!loginResult.success) {
		return fail(loginResult.error);
	}

	redirect("/", RedirectType.replace);
}

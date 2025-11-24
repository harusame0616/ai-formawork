"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { getUserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { CustomerTag } from "@/features/customer/tag";
import { deleteCustomerNote } from "./delete-customer-note";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const NOTE_NOT_FOUND_ERROR_MESSAGE =
	"指定されたノートが見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type DeleteCustomerNoteActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof NOTE_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const deleteCustomerNoteSchema = v.object({
	noteId: v.pipe(v.string(), v.uuid()),
});

type DeleteCustomerNoteInput = v.InferInput<typeof deleteCustomerNoteSchema>;

export async function deleteCustomerNoteAction(
	params: DeleteCustomerNoteInput,
): Promise<Result<undefined, DeleteCustomerNoteActionErrorMessage>> {
	const logger = await getLogger("deleteCustomerNoteAction");
	logger.info("deleteCustomerNoteAction を実行", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(deleteCustomerNoteSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("バリデーション失敗", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { noteId } = paramsParseResult.output;

	// 認証情報の取得
	const userId = await getUserStaffId();
	if (!userId) {
		logger.warn("認証されていないアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	const role = await getUserRole();

	// 削除処理を実行
	const result = await deleteCustomerNote({
		customerNoteId: noteId,
		user: { role, userId },
	});

	if (!result.success) {
		return result;
	}

	// キャッシュの更新
	updateTag(CustomerTag.NoteCrud(result.data.customerId));

	return succeed();
}

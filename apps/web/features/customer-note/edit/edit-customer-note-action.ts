"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { getUserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { CustomerTag } from "@/features/customer/tag";
import { editCustomerNote } from "./edit-customer-note";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const NOTE_NOT_FOUND_ERROR_MESSAGE =
	"指定されたノートが見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type EditCustomerNoteActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof NOTE_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const editCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	keepImagePaths: v.optional(v.array(v.string()), []),
	noteId: v.pipe(v.string(), v.uuid()),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

type EditCustomerNoteInput = v.InferInput<typeof editCustomerNoteSchema>;

export async function editCustomerNoteAction(
	params: EditCustomerNoteInput,
): Promise<Result<undefined, EditCustomerNoteActionErrorMessage>> {
	const logger = await getLogger("editCustomerNoteAction");
	logger.info("editCustomerNoteAction を実行", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(editCustomerNoteSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("バリデーション失敗", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { content, noteId, uploadImages, keepImagePaths } =
		paramsParseResult.output;

	// 認証情報の取得
	const userId = await getUserStaffId();
	if (!userId) {
		logger.warn("認証されていないアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	const role = await getUserRole();

	// 編集処理を実行
	const result = await editCustomerNote({
		content,
		customerNoteId: noteId,
		keepImagePaths,
		uploadImages,
		user: { role, userId },
	});

	if (!result.success) {
		return result;
	}

	// キャッシュの更新
	updateTag(CustomerTag.NoteCrud(result.data.customerId));

	return succeed();
}

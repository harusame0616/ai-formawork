"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "@workspace/db/schema/customer-note";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { getUserStaffId } from "../../../lib/auth/get-user-staff-id";
import { CustomerTag } from "../tag";

const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type RegisterCustomerNoteActionErrorMessage =
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const BUCKET_NAME = "customer-note-attachments";

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const registerCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	customerId: v.pipe(v.string(), v.uuid()),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

type RegisterCustomerNoteInput = v.InferInput<
	typeof registerCustomerNoteSchema
>;

export async function registerCustomerNoteAction(
	params: RegisterCustomerNoteInput,
): Promise<Result<undefined, RegisterCustomerNoteActionErrorMessage>> {
	const logger = await getLogger("registerCustomerNoteAction");
	logger.info("execute registerCustomerNoteAction", {
		params,
	});

	// バリデーション
	const paramsParseResult = v.safeParse(registerCustomerNoteSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("Validation failed", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { content, customerId, uploadImages } = paramsParseResult.output;

	// 認証情報の取得
	const staffId = await getUserStaffId();
	if (!staffId) {
		logger.warn("Unauthorized access", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	try {
		// 顧客ノートの登録
		const [insertedNote] = await db
			.insert(customerNotesTable)
			.values({
				content,
				customerId,
				staffId,
			})
			.returning({ id: customerNotesTable.id });

		const noteId = insertedNote.id;

		// 画像がある場合は移動とDB保存
		if (uploadImages.length > 0) {
			const supabase = createAdminClient();

			for (let i = 0; i < uploadImages.length; i++) {
				const uploadImage = uploadImages[i];
				if (!uploadImage) continue;

				const { permanentPath, temporaryPath } = uploadImage;

				// ファイルを移動
				const { error: moveError } = await supabase.storage
					.from(BUCKET_NAME)
					.move(temporaryPath, permanentPath);

				if (moveError) {
					logger.error("Failed to move image file", {
						err: moveError,
						permanentPath,
						temporaryPath,
					});
					// 画像の移動に失敗しても続行（ノートは登録済み）
					continue;
				}

				// DBに画像情報を保存
				await db.insert(customerNoteImagesTable).values({
					customerNoteId: noteId,
					displayOrder: i,
					path: permanentPath,
				});
			}
		}

		logger.info("Customer note registered successfully", {
			action: "register-customer-note",
			customerId,
			imageCount: uploadImages.length,
			noteId,
		});

		updateTag(CustomerTag.NoteCrud(customerId));
	} catch (error) {
		logger.error("Failed to register customer note", {
			action: "register-customer-note",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}

	return succeed();
}

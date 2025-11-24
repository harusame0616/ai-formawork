"use server";

import { randomUUID } from "node:crypto";
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
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
import { CustomerTag } from "@/features/customer/tag";

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
		const noteId = randomUUID();
		const supabase = createAdminClient();

		await db.transaction(async (tx) => {
			// 顧客ノートの登録
			await tx.insert(customerNotesTable).values({
				content,
				customerId,
				id: noteId,
				staffId,
			});

			// 画像がある場合は並列で移動してまとめてDB保存
			if (uploadImages.length > 0) {
				// 全ての画像を並列で移動
				const moveResults = await Promise.all(
					uploadImages.map(async (uploadImage, i) => {
						const { permanentPath, temporaryPath } = uploadImage;

						const { error: moveError } = await supabase.storage
							.from(BUCKET_NAME)
							.move(temporaryPath, permanentPath);

						if (moveError) {
							logger.error("Failed to move image file", {
								displayOrder: i,
								err: moveError,
								permanentPath,
								temporaryPath,
							});
							throw new Error(
								`Failed to move image file: ${moveError.message}`,
							);
						}

						return {
							displayOrder: i,
							path: permanentPath,
						};
					}),
				);

				// 全ての画像情報をまとめてDB保存
				await tx.insert(customerNoteImagesTable).values(
					moveResults.map((result) => ({
						customerNoteId: noteId,
						displayOrder: result.displayOrder,
						path: result.path,
					})),
				);
			}
		});

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

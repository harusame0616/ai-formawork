import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";
import { UserRole } from "../../../lib/auth/get-user-role";

const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const NOTE_NOT_FOUND_ERROR_MESSAGE =
	"指定されたノートが見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type EditCustomerNoteErrorMessage =
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof NOTE_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const BUCKET_NAME = "customer-note-attachments";

type UploadImage = {
	permanentPath: string;
	temporaryPath: string;
};

type EditCustomerNoteInput = {
	customerNoteId: string;
	content: string;
	uploadImages: UploadImage[];
	keepImagePaths: string[]; // 保持する既存画像のパス
	user: {
		role: UserRole;
		userId: string;
	};
};

type EditCustomerNoteSuccess = {
	customerId: string;
};

export async function editCustomerNote(
	input: EditCustomerNoteInput,
): Promise<Result<EditCustomerNoteSuccess, EditCustomerNoteErrorMessage>> {
	const logger = await getLogger("editCustomerNote");
	const { customerNoteId, content, uploadImages, keepImagePaths, user } = input;

	try {
		// ノートの取得と認可チェック
		const note = await db.query.customerNotesTable.findFirst({
			where: eq(customerNotesTable.id, customerNoteId),
		});

		if (!note) {
			logger.warn("ノートが見つかりません", {
				noteId: customerNoteId,
			});
			return fail(NOTE_NOT_FOUND_ERROR_MESSAGE);
		}

		// 作成者チェック
		if (note.staffId !== user.userId && user.role !== UserRole.Admin) {
			logger.warn("権限がないアクセス", {
				event: EventType.AuthorizationError,
				noteId: customerNoteId,
				noteStaffId: note.staffId,
				requestStaffId: user.userId,
			});
			return fail(FORBIDDEN_ERROR_MESSAGE);
		}

		const supabase = createAdminClient();

		// 既存画像の取得
		const existingImages = await db
			.select({
				displayOrder: customerNoteImagesTable.displayOrder,
				path: customerNoteImagesTable.path,
			})
			.from(customerNoteImagesTable)
			.where(eq(customerNoteImagesTable.customerNoteId, customerNoteId));

		// 削除対象の画像（keepImagePathsに含まれていない画像）
		const imagesToDelete = existingImages.filter(
			(img) => !keepImagePaths.includes(img.path),
		);

		// 保持する既存画像
		const imagesToKeep = existingImages.filter((img) =>
			keepImagePaths.includes(img.path),
		);

		let allImages: { path: string }[] = [];

		await db.transaction(async (tx) => {
			// ノート内容の更新
			await tx
				.update(customerNotesTable)
				.set({
					content,
					updatedAt: new Date(),
				})
				.where(eq(customerNotesTable.id, customerNoteId));

			// 既存の画像レコードを全て削除
			await tx
				.delete(customerNoteImagesTable)
				.where(eq(customerNoteImagesTable.customerNoteId, customerNoteId));

			// 新しい画像を並列で移動
			const newImageResults = await Promise.all(
				uploadImages.map(async (uploadImage) => {
					const { permanentPath, temporaryPath } = uploadImage;

					const { error: moveError } = await supabase.storage
						.from(BUCKET_NAME)
						.move(temporaryPath, permanentPath);

					if (moveError) {
						logger.error("Failed to move image file", {
							err: moveError,
							permanentPath,
							temporaryPath,
						});
						throw new Error(`Failed to move image file: ${moveError.message}`);
					}

					return {
						path: permanentPath,
					};
				}),
			);

			// 保持する既存画像と新規画像を結合してdisplayOrderを再設定
			allImages = [
				...imagesToKeep.map((img) => ({ path: img.path })),
				...newImageResults,
			];

			// 全ての画像情報をまとめてDB保存
			if (allImages.length > 0) {
				await tx.insert(customerNoteImagesTable).values(
					allImages.map((img, index) => ({
						customerNoteId,
						displayOrder: index,
						path: img.path,
					})),
				);
			}
		});

		// Supabase Storage から削除対象の画像ファイルを削除（並列処理）
		if (imagesToDelete.length > 0) {
			await Promise.allSettled(
				imagesToDelete.map(async (image) => {
					const { error } = await supabase.storage
						.from(BUCKET_NAME)
						.remove([image.path]);

					if (error) {
						logger.error("画像ファイルの削除に失敗", {
							err: error,
							path: image.path,
						});
					}
				}),
			);
		}

		logger.info("顧客ノートの編集に成功", {
			action: "edit-customer-note",
			customerId: note.customerId,
			imageCount: allImages.length,
			noteId: customerNoteId,
		});

		return succeed({ customerId: note.customerId });
	} catch (error) {
		logger.error("顧客ノートの編集に失敗", {
			action: "edit-customer-note",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

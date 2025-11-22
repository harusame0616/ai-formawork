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

type DeleteCustomerNoteErrorMessage =
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof NOTE_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const BUCKET_NAME = "customer-note-attachments";

type DeleteCustomerNoteInput = {
	customerNoteId: string;
	user: {
		role: UserRole;
		userId: string;
	};
};

type DeleteCustomerNoteSuccess = {
	customerId: string;
};

export async function deleteCustomerNote(
	input: DeleteCustomerNoteInput,
): Promise<Result<DeleteCustomerNoteSuccess, DeleteCustomerNoteErrorMessage>> {
	const logger = await getLogger("deleteCustomerNote");
	const { customerNoteId, user } = input;

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

		// ノートに関連する画像を取得
		const images = await db
			.select({
				path: customerNoteImagesTable.path,
			})
			.from(customerNoteImagesTable)
			.where(eq(customerNoteImagesTable.customerNoteId, customerNoteId));

		const supabase = createAdminClient();

		await db
			.delete(customerNotesTable)
			.where(eq(customerNotesTable.id, customerNoteId));

		// Supabase Storage から画像ファイルを削除（並列処理）
		if (images.length > 0) {
			await Promise.allSettled(
				images.map(async (image) => {
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

		logger.info("顧客ノートの削除に成功", {
			action: "delete-customer-note",
			customerId: note.customerId,
			imageCount: images.length,
			noteId: customerNoteId,
		});

		return succeed({ customerId: note.customerId });
	} catch (error) {
		logger.error("顧客ノートの削除に失敗", {
			action: "delete-customer-note",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "@workspace/db/schema/customer-note";
import { eq } from "drizzle-orm";

const CUSTOMER_NOT_FOUND_ERROR_MESSAGE =
	"指定された顧客が見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type DeleteCustomerErrorMessage =
	| typeof CUSTOMER_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const BUCKET_NAME = "customer-note-attachments";

type DeleteCustomerInput = {
	customerId: string;
};

export async function deleteCustomer({
	customerId,
}: DeleteCustomerInput): Promise<
	Result<undefined, DeleteCustomerErrorMessage>
> {
	const logger = await getLogger("deleteCustomer");

	try {
		// 顧客の存在確認
		const [customer] = await db
			.select()
			.from(customersTable)
			.where(eq(customersTable.customerId, customerId))
			.limit(1);

		if (!customer) {
			logger.warn("顧客が見つかりません", {
				customerId,
			});
			return fail(CUSTOMER_NOT_FOUND_ERROR_MESSAGE);
		}

		// 顧客に関連するノートの画像を取得
		const images = await db
			.select({
				path: customerNoteImagesTable.path,
			})
			.from(customerNoteImagesTable)
			.innerJoin(
				customerNotesTable,
				eq(customerNoteImagesTable.customerNoteId, customerNotesTable.id),
			)
			.where(eq(customerNotesTable.customerId, customerId));

		// 顧客を削除（関連ノートと画像はカスケード削除される）
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customerId));

		// 画像がない場合は早期リターン
		if (images.length === 0) {
			logger.info("顧客の削除に成功", {
				action: "delete-customer",
				customerId,
				imageCount: 0,
			});
			return succeed();
		}

		// Supabase Storage から画像ファイルを削除（並列処理）
		const supabase = createAdminClient();
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

		logger.info("顧客の削除に成功", {
			action: "delete-customer",
			customerId,
			imageCount: images.length,
		});

		return succeed();
	} catch (error) {
		logger.error("顧客の削除に失敗", {
			action: "delete-customer",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

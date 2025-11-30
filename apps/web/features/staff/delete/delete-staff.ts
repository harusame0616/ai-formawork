import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";

const STAFF_NOT_FOUND_ERROR_MESSAGE =
	"指定されたスタッフが見つかりません" as const;
const CANNOT_DELETE_SELF_ERROR_MESSAGE = "自分自身は削除できません" as const;

type DeleteStaffErrorMessage =
	| typeof STAFF_NOT_FOUND_ERROR_MESSAGE
	| typeof CANNOT_DELETE_SELF_ERROR_MESSAGE;

type DeleteStaffInput = {
	currentUserStaffId: string;
	staffId: string;
};

export async function deleteStaff({
	currentUserStaffId,
	staffId,
}: DeleteStaffInput): Promise<Result<undefined, DeleteStaffErrorMessage>> {
	const logger = await getLogger("deleteStaff");

	if (staffId === currentUserStaffId) {
		logger.warn("自分自身を削除しようとしました", { staffId });
		return fail(CANNOT_DELETE_SELF_ERROR_MESSAGE);
	}

	const [staff] = await db
		.select({
			authUserId: staffsTable.authUserId,
			staffId: staffsTable.staffId,
		})
		.from(staffsTable)
		.where(eq(staffsTable.staffId, staffId))
		.limit(1);

	if (!staff) {
		logger.warn("スタッフが見つかりません", { staffId });
		return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
	}

	const supabase = createAdminClient();

	await db.transaction(async (tx) => {
		await tx.delete(staffsTable).where(eq(staffsTable.staffId, staffId));

		if (!staff.authUserId) {
			return;
		}

		const { error: deleteError } = await supabase.auth.admin.deleteUser(
			staff.authUserId,
		);

		if (deleteError) {
			logger.error("Auth ユーザーの削除に失敗", {
				err: deleteError,
				staffId,
			});
			throw deleteError;
		}
	});

	logger.info("スタッフの削除に成功", {
		action: "delete-staff",
		staffId,
	});

	return succeed();
}

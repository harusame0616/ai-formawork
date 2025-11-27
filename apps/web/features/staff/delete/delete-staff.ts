import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";

const STAFF_NOT_FOUND_ERROR_MESSAGE =
	"指定されたスタッフが見つかりません" as const;
const CANNOT_DELETE_SELF_ERROR_MESSAGE = "自分自身は削除できません" as const;
const AUTH_USER_NOT_FOUND_ERROR_MESSAGE =
	"認証ユーザーが見つかりません" as const;

type DeleteStaffErrorMessage =
	| typeof STAFF_NOT_FOUND_ERROR_MESSAGE
	| typeof CANNOT_DELETE_SELF_ERROR_MESSAGE
	| typeof AUTH_USER_NOT_FOUND_ERROR_MESSAGE;

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
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.id, staffId))
		.limit(1);

	if (!staff) {
		logger.warn("スタッフが見つかりません", { staffId });
		return fail(STAFF_NOT_FOUND_ERROR_MESSAGE);
	}

	const supabase = createAdminClient();

	const { data: usersData, error: listError } =
		await supabase.auth.admin.listUsers();

	if (listError) {
		logger.error("Auth ユーザー一覧の取得に失敗", { err: listError });
		throw listError;
	}

	const authUser = usersData.users.find(
		// biome-ignore lint: ts4111
		(user) => user.app_metadata?.["staffId"] === staffId,
	);

	if (!authUser) {
		logger.warn("Auth ユーザーが見つかりません", { staffId });
		return fail(AUTH_USER_NOT_FOUND_ERROR_MESSAGE);
	}

	await db.transaction(async (tx) => {
		await tx.delete(staffsTable).where(eq(staffsTable.id, staffId));

		const { error: deleteError } = await supabase.auth.admin.deleteUser(
			authUser.id,
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

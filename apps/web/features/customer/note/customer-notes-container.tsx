import { createClient } from "@repo/supabase/nextjs/server";
import { getUserRole, UserRole } from "../../../lib/auth/get-user-role";
import { getUserStaffId } from "../../../lib/auth/get-user-staff-id";
import { CustomerNotesPresenter } from "./customer-notes-presenter";
import {
	type CustomerNoteSearchCondition,
	getCustomerNotes,
} from "./get-customer-notes";

type CustomerNotesContainerProps = {
	customerIdPromise: Promise<string>;
	searchConditionPromise: Promise<{
		dateFrom?: string;
		dateTo?: string;
		keyword?: string;
		page?: number;
	}>;
};

export async function CustomerNotesContainer({
	customerIdPromise,
	searchConditionPromise,
}: CustomerNotesContainerProps) {
	const customerId = await customerIdPromise;
	const searchCondition = await searchConditionPromise;

	// 検索条件を構築
	const condition: CustomerNoteSearchCondition = {
		customerId,
		dateFrom: searchCondition.dateFrom
			? new Date(searchCondition.dateFrom)
			: undefined,
		dateTo: searchCondition.dateTo
			? new Date(searchCondition.dateTo)
			: undefined,
		keyword: searchCondition.keyword,
		page: searchCondition.page,
	};

	// データを並列取得
	const [{ notes, totalCount, currentPage, totalPages, authors }, supabase] =
		await Promise.all([getCustomerNotes(condition), createClient()]);

	// 現在のユーザーとロールを取得
	const [currentStaffId, userRole] = await Promise.all([
		getUserStaffId(supabase),
		getUserRole(supabase),
	]);

	// 各ノートの編集・削除権限を判定
	const notesWithPermissions = notes.map((note) => {
		const isOwner = currentStaffId === note.staffId;
		const isAdmin = userRole === UserRole.Admin;
		const canEdit = isOwner || isAdmin;

		// 記入者の名前を取得
		const author = authors.find((a) => a.staffId === note.staffId);

		return {
			...note,
			authorName: author?.name ?? "不明",
			canEdit,
		};
	});

	return (
		<CustomerNotesPresenter
			currentPage={currentPage}
			notes={notesWithPermissions}
			totalCount={totalCount}
			totalPages={totalPages}
		/>
	);
}

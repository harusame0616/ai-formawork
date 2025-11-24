import { getUserRole, UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";
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

	const [
		{ notes, totalCount, currentPage, totalPages },
		currentUserStaffId,
		currentUserRole,
	] = await Promise.all([
		getCustomerNotes(condition),
		getUserStaffId(),
		getUserRole(),
	]);

	const notesWithPermissions = notes.map((note) => {
		const isOwner = currentUserStaffId === note.staffId;
		const isAdmin = currentUserRole === UserRole.Admin;

		return {
			...note,
			authorName: note.staffName ?? "",
			canEdit: isOwner || isAdmin,
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

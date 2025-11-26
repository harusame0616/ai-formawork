import { getStaffs } from "./get-staffs";
import type { StaffsCondition } from "./schema";
import { StaffsPresenter } from "./staffs-presenter";

export async function StaffsContainer({
	condition,
}: {
	condition: Promise<StaffsCondition>;
}) {
	const { staffs, page, totalPages } = await getStaffs(await condition);

	return (
		<StaffsPresenter page={page} staffs={staffs} totalPages={totalPages} />
	);
}

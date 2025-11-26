import type { StaffsConditionSearchParams } from "./schema";
import { StaffSearchForm } from "./staff-search-form-presenter";

export async function StaffSearchFormContainer({
	conditionPromise,
}: {
	conditionPromise: Promise<Omit<StaffsConditionSearchParams, "page">>;
}) {
	return <StaffSearchForm condition={await conditionPromise} />;
}

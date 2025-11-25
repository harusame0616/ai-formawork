import { CustomerSearchForm } from "./customer-search-form-presenter";
import type { CustomersConditionSearchParams } from "./schema";

export async function CustomerSearchFormContainer({
	conditionPromise,
}: {
	conditionPromise: Promise<Omit<CustomersConditionSearchParams, "page">>;
}) {
	return <CustomerSearchForm condition={await conditionPromise} />;
}

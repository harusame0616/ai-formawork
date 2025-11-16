import * as v from "valibot";
import { CustomerNotesContainer } from "../../../../../features/customer/note/customer-notes-container";
import { CustomerNotesSearchForm } from "../../../../../features/customer/note/customer-notes-search-form";
import { CustomerNotesSkeleton } from "../../../../../features/customer/note/customer-notes-skeleton";
import { SuspenseOnSearch } from "../../../../../libs/suspense-on-search";

const searchParamsSchema = v.object({
	dateFrom: v.optional(v.string()),
	dateTo: v.optional(v.string()),
	keyword: v.optional(v.string()),
	page: v.optional(v.pipe(v.string(), v.transform(Number)), "1"),
});

export default async function CustomerNotesPage({
	params,
	searchParams,
}: PageProps<"/customers/[customerId]/notes">) {
	const customerIdPromise = params.then(({ customerId }) => customerId);
	const searchConditionPromise = searchParams.then((sp) =>
		v.parse(searchParamsSchema, sp),
	);

	return (
		<div className="space-y-4">
			<SuspenseOnSearch fallback={<CustomerNotesSearchForm disabled />}>
				<CustomerNotesSearchForm condition={searchConditionPromise} />
			</SuspenseOnSearch>

			<SuspenseOnSearch fallback={<CustomerNotesSkeleton />}>
				<CustomerNotesContainer
					customerIdPromise={customerIdPromise}
					searchConditionPromise={searchConditionPromise}
				/>
			</SuspenseOnSearch>
		</div>
	);
}

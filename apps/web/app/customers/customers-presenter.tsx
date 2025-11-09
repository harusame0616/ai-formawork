import type { SearchCustomersResult } from "../../features/customer/search-customers";
import { SearchForm } from "./search-form";
import { CustomersTable } from "./customers-table";
import { CustomersPagination } from "./customers-pagination";

type CustomersPresenterProps = {
	data: SearchCustomersResult;
	keyword: string;
};

export function CustomersPresenter({
	data,
	keyword,
}: CustomersPresenterProps) {
	return (
		<div className="space-y-6">
			<SearchForm defaultKeyword={keyword} />
			<CustomersTable customers={data.customers} />
			<CustomersPagination
				currentPage={data.page}
				totalPages={data.totalPages}
				totalCount={data.totalCount}
			/>
		</div>
	);
}

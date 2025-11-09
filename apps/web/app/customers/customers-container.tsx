import * as v from "valibot";
import { getCustomers } from "../../features/customer/get-customers";
import {
	type CustomerSearchParams,
	customerSearchSchema,
} from "../../features/customer/schema";
import { CustomersPresenter } from "./customers-presenter";

type CustomersContainerProps = {
	searchParams: Record<string, string | string[] | undefined>;
};

export async function CustomersContainer({
	searchParams,
}: CustomersContainerProps) {
	// URLパラメータをパースしてバリデーション
	const parsedParams = v.safeParse(customerSearchSchema, {
		keyword: typeof searchParams["keyword"] === "string" ? searchParams["keyword"] : undefined,
		page: searchParams["page"] ? Number(searchParams["page"]) : undefined,
	});

	const params: CustomerSearchParams = parsedParams.success
		? parsedParams.output
		: { page: 1, pageSize: 20 };

	// データ取得
	const result = await getCustomers(params);

	return <CustomersPresenter {...result} keyword={params.keyword} />;
}

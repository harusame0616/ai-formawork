import { searchCustomersAction } from "./search-customers-action";
import { CustomersPresenter } from "./customers-presenter";

type CustomersContainerProps = {
	searchParams: Promise<{ keyword?: string; page?: string }>;
};

export async function CustomersContainer({
	searchParams,
}: CustomersContainerProps) {
	const params = await searchParams;
	const keyword = params.keyword || "";
	const page = params.page ? Number.parseInt(params.page, 10) : 1;

	const result = await searchCustomersAction({
		keyword,
		page,
		pageSize: 20,
	});

	if (!result.success) {
		return (
			<div className="text-center text-red-600">
				顧客一覧の取得に失敗しました
			</div>
		);
	}

	return <CustomersPresenter data={result.data} keyword={keyword} />;
}

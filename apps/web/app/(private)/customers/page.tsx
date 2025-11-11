import { Card } from "@workspace/ui/components/card";
import { Suspense } from "react";
import * as v from "valibot";
import { customerSearchParamsSchema } from "../../../features/customer/schema";
import { SuspenseOnSearch } from "../../../libs/suspense-on-search";
import { CustomerSearchForm } from "./customer-search-form";
import { CustomersContainer } from "./customers-container";
import { CustomersSkeleton } from "./customers-skeleton";

type CustomersPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CustomersPage({ searchParams }: CustomersPageProps) {
	const validatedCondition = searchParams.then((params) => {
		const parsedParams = v.safeParse(customerSearchParamsSchema, params);

		return parsedParams.success
			? {
					keyword: parsedParams.output.keyword,
					page: parsedParams.output.page,
				}
			: {};
	});

	return (
		<div className="container mx-auto p-2 space-y-4">
			<h1 className="font-bold">顧客一覧</h1>
			<Card className="p-4 w-full">
				<Suspense>
					<CustomerSearchForm />
				</Suspense>
			</Card>
			<Card className="py-2 w-full">
				<SuspenseOnSearch fallback={<CustomersSkeleton />}>
					<CustomersContainer condition={validatedCondition} />
				</SuspenseOnSearch>
			</Card>
		</div>
	);
}

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Suspense } from "react";
import * as v from "valibot";
import { customerSearchParamsSchema } from "../../features/customer/schema";
import { SuspenseOnSearch } from "../../libs/suspense-on-search";
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
					page: parsedParams.output.page ?? 1,
				}
			: { page: 1 };
	});

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>顧客一覧</CardTitle>
					<CardDescription>
						名前、メールアドレス、電話番号で検索できます
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<Suspense>
						<CustomerSearchForm />
					</Suspense>
					<SuspenseOnSearch fallback={<CustomersSkeleton />}>
						<CustomersContainer condition={validatedCondition} />
					</SuspenseOnSearch>
				</CardContent>
			</Card>
		</div>
	);
}

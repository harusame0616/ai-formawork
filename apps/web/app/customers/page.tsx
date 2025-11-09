import { getLogger } from "@repo/logger/nextjs/server";
import { Card } from "@workspace/ui/components/card";
import { cacheTag } from "next/cache";
import * as v from "valibot";
import { getCustomers } from "@/features/customer/get-customers";
import { GetCustomersQuerySchema } from "@/features/customer/schema";
import { CustomerListPresenter } from "./customer-list-presenter";
import { CustomerPagination } from "./customer-pagination";
import { CustomerSearchForm } from "./customer-search-form";

const TAG_CUSTOMERS = "tag_customers";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({ searchParams }: PageProps) {
	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">顧客一覧</h1>
			<Card className="p-6">
				<div className="mb-6">
					<CustomerSearchForm />
				</div>
				<CustomersContainer searchParams={searchParams} />
			</Card>
		</div>
	);
}

async function CustomersContainer({ searchParams }: PageProps) {
	"use cache";

	cacheTag(TAG_CUSTOMERS);

	const logger = await getLogger("CustomersContainer");
	const params = await searchParams;

	const parsedQuery = v.safeParse(GetCustomersQuerySchema, {
		// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
		keyword: typeof params["keyword"] === "string" ? params["keyword"] : "",
		page:
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			typeof params["page"] === "string"
				? // biome-ignore lint/complexity/useLiteralKeys: ts(4111)
					Number.parseInt(params["page"], 10)
				: 1,
		perPage: 20,
	});

	if (!parsedQuery.success) {
		logger.warn("Invalid query parameters");
		return <div className="text-red-500">無効なクエリパラメータです</div>;
	}

	const result = await getCustomers(parsedQuery.output);

	return (
		<div className="space-y-6">
			<div className="text-sm text-neutral-500">
				全 {result.totalCount} 件中 {result.customers.length} 件を表示
			</div>
			<CustomerListPresenter customers={result.customers} />
			<CustomerPagination
				currentPage={result.currentPage}
				totalPages={result.totalPages}
			/>
		</div>
	);
}

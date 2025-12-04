import { db } from "@workspace/db/client";
import type { SelectCustomer } from "@workspace/db/schema/customer";
import { customersTable } from "@workspace/db/schema/customer";
import { asc, eq, or } from "drizzle-orm";

const PAGE_SIZE = 20;

type GetCustomersForMcpParams = {
	keyword?: string;
	page?: number;
};

type GetCustomersForMcpResult = {
	customers: SelectCustomer[];
	page: number;
	totalPages: number;
};

export async function getCustomersForMcp({
	keyword,
	page = 1,
}: GetCustomersForMcpParams): Promise<GetCustomersForMcpResult> {
	const whereConditions = keyword
		? or(
				eq(customersTable.firstName, keyword),
				eq(customersTable.lastName, keyword),
			)
		: undefined;

	const customers = await db
		.select()
		.from(customersTable)
		.where(whereConditions)
		.orderBy(asc(customersTable.lastName), asc(customersTable.firstName))
		.limit(PAGE_SIZE)
		.offset((page - 1) * PAGE_SIZE);

	const total = await db.$count(customersTable, whereConditions);

	return {
		customers,
		page,
		totalPages: Math.ceil(total / PAGE_SIZE),
	};
}

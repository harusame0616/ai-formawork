import { db } from "@workspace/db/client";
import type { SelectCustomer } from "@workspace/db/schema/customer";
import { customersTable } from "@workspace/db/schema/customer";
import { desc, ilike, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "../tag";
import type { CustomersCondition } from "./schema";

type GetCustomersResult = {
	customers: SelectCustomer[];
	page: number;
	totalPages: number;
};

export async function getCustomers({
	keyword,
	page,
}: CustomersCondition): Promise<GetCustomersResult> {
	"use cache";
	cacheLife("permanent");
	cacheTag(CustomerTag.crud);

	const pageSize = 20;
	const whereConditions = keyword
		? or(
				ilike(customersTable.name, `%${keyword}%`),
				ilike(customersTable.email, `%${keyword}%`),
				ilike(customersTable.phone, `%${keyword}%`),
			)
		: undefined;

	const customers = await db
		.select()
		.from(customersTable)
		.where(whereConditions)
		.orderBy(desc(customersTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db.$count(customersTable, whereConditions);

	return {
		customers,
		page,
		totalPages: Math.ceil(total / pageSize),
	};
}

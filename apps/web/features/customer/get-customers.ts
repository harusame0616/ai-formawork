import { db } from "@workspace/db/client";
import type { SelectCustomer } from "@workspace/db/schema/customer";
import { customersTable } from "@workspace/db/schema/customer";
import { count, desc, ilike, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import * as v from "valibot";
import {
	CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH,
	type CustomerSearchCondition,
} from "./schema";

type GetCustomersResult = {
	customers: SelectCustomer[];
	page: number;
	totalPages: number;
};

const getCustomersParamsSchema = v.object({
	keyword: v.optional(
		v.pipe(v.string(), v.maxLength(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH)),
	),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
});

export async function getCustomers(
	params: CustomerSearchCondition,
): Promise<GetCustomersResult> {
	"use cache";

	cacheLife("permanent");
	cacheTag("customer-crud");

	const validatedParams = v.parse(getCustomersParamsSchema, params);
	const { keyword, page } = validatedParams;
	const pageSize = 20;

	const whereConditions = keyword
		? or(
				ilike(customersTable.name, `%${keyword}%`),
				ilike(customersTable.email, `%${keyword}%`),
				ilike(customersTable.phone, `%${keyword}%`),
			)
		: undefined;

	const result = await db
		.select({ count: count() })
		.from(customersTable)
		.where(whereConditions);
	const total = Number(result[0]?.count) || 0;

	const customers = await db
		.select()
		.from(customersTable)
		.where(whereConditions)
		.orderBy(desc(customersTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return {
		customers,
		page,
		totalPages: Math.ceil(total / pageSize),
	};
}

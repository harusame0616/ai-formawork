import { db } from "@workspace/db/client";
import type { SelectCustomer } from "@workspace/db/schema/customer";
import { customersTable } from "@workspace/db/schema/customer";
import { count, sql } from "drizzle-orm";
import type { CustomerSearchParams } from "./schema";

export type GetCustomersResult = {
	customers: SelectCustomer[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export async function getCustomers(
	params: CustomerSearchParams,
): Promise<GetCustomersResult> {
	const { keyword, page = 1, pageSize = 20 } = params;

	// 検索条件の構築
	const whereConditions = keyword
		? sql`(${customersTable.name} ILIKE ${`%${keyword}%`} OR ${customersTable.email} ILIKE ${`%${keyword}%`} OR ${customersTable.phone} ILIKE ${`%${keyword}%`})`
		: sql`1=1`;

	// 総件数を取得
	const result = await db
		.select({ count: count() })
		.from(customersTable)
		.where(whereConditions);
	const total = Number(result[0]?.count) || 0;

	// ページネーション付きでデータを取得
	const customers = await db
		.select()
		.from(customersTable)
		.where(whereConditions)
		.orderBy(sql`${customersTable.createdAt} DESC`)
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return {
		customers,
		page,
		pageSize,
		total,
		totalPages: Math.ceil(total / pageSize),
	};
}

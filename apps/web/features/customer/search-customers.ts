import { fail, succeed, type Result } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable, type SelectCustomer } from "@workspace/db/schema/customer";
import { and, count, ilike, or, sql } from "drizzle-orm";
import type { SearchCustomersSchema } from "./schema";

export type SearchCustomersResult = {
	customers: SelectCustomer[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type SearchCustomersError = {
	message: string;
};

export async function searchCustomers(
	params: SearchCustomersSchema,
): Promise<Result<SearchCustomersResult, SearchCustomersError>> {
	try {
		const { keyword, page = 1, pageSize = 20 } = params;

		// 検索条件の構築
		const searchConditions = keyword
			? or(
					ilike(customersTable.name, `%${keyword}%`),
					ilike(customersTable.email, `%${keyword}%`),
					ilike(customersTable.phoneNumber, `%${keyword}%`),
				)
			: undefined;

		// 総件数を取得
		const [countResult] = await db
			.select({ count: count() })
			.from(customersTable)
			.where(searchConditions);

		const totalCount = countResult?.count ?? 0;
		const totalPages = Math.ceil(totalCount / pageSize);

		// ページネーション付きで顧客一覧を取得
		const customers = await db
			.select()
			.from(customersTable)
			.where(searchConditions)
			.orderBy(customersTable.createdAt)
			.limit(pageSize)
			.offset((page - 1) * pageSize);

		return succeed({
			customers,
			totalCount,
			page,
			pageSize,
			totalPages,
		});
	} catch (error) {
		return fail({
			message: "顧客一覧の取得に失敗しました",
		});
	}
}

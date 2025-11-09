import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { ilike, or, sql } from "drizzle-orm";
import type { GetCustomersQuery } from "./schema";

export type Customer = {
	customerId: string;
	name: string;
	email: string;
	phoneNumber: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export async function getCustomers(query: GetCustomersQuery): Promise<{
	customers: Customer[];
	totalCount: number;
	totalPages: number;
	currentPage: number;
}> {
	const { keyword = "", page = 1, perPage = 20 } = query;
	const offset = (page - 1) * perPage;

	const whereConditions = keyword
		? or(
				ilike(customersTable.name, `%${keyword}%`),
				ilike(customersTable.email, `%${keyword}%`),
				ilike(customersTable.phoneNumber, `%${keyword}%`),
			)
		: undefined;

	const [customers, totalCountResult] = await Promise.all([
		db
			.select({
				createdAt: customersTable.createdAt,
				customerId: customersTable.customerId,
				email: customersTable.email,
				name: customersTable.name,
				phoneNumber: customersTable.phoneNumber,
				updatedAt: customersTable.updatedAt,
			})
			.from(customersTable)
			.where(whereConditions)
			.orderBy(customersTable.createdAt)
			.limit(perPage)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)` })
			.from(customersTable)
			.where(whereConditions),
	]);

	const totalCount = totalCountResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalCount / perPage);

	return {
		currentPage: page,
		customers,
		totalCount,
		totalPages,
	};
}

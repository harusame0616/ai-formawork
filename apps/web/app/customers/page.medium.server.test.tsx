import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq, inArray } from "drizzle-orm";
import { expect, test } from "vitest";
import CustomersPage from "./page";

test("顧客一覧ページが正しくレンダリングされる", async () => {
	const testCustomers = [
		{
			customerId: crypto.randomUUID(),
			email: "test1@example.com",
			name: "Test User 1",
			phoneNumber: "090-1111-1111",
		},
		{
			customerId: crypto.randomUUID(),
			email: "test2@example.com",
			name: "Test User 2",
			phoneNumber: "090-2222-2222",
		},
	];

	await db.insert(customersTable).values(testCustomers);

	try {
		const searchParams = Promise.resolve({});
		const result = await CustomersPage({ searchParams });

		expect(result).toBeDefined();
		expect(result.type).toBe("div");
	} finally {
		await db.delete(customersTable).where(
			inArray(
				customersTable.customerId,
				testCustomers.map((c) => c.customerId),
			),
		);
	}
});

test("検索パラメータが正しく処理される", async () => {
	const testCustomer = {
		customerId: crypto.randomUUID(),
		email: "searchtest@example.com",
		name: "Search Test User",
		phoneNumber: "090-3333-3333",
	};

	await db.insert(customersTable).values(testCustomer);

	try {
		const searchParams = Promise.resolve({ keyword: "Search Test" });
		const result = await CustomersPage({ searchParams });

		expect(result).toBeDefined();
	} finally {
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, testCustomer.customerId));
	}
});

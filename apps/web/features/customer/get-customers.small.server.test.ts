import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { getCustomers } from "./get-customers";

describe("getCustomers", () => {
	const testCustomers = [
		{
			customerId: crypto.randomUUID(),
			email: "alice@example.com",
			name: "Alice Smith",
			phoneNumber: "090-1234-5678",
		},
		{
			customerId: crypto.randomUUID(),
			email: "bob@example.com",
			name: "Bob Johnson",
			phoneNumber: "080-2345-6789",
		},
		{
			customerId: crypto.randomUUID(),
			email: "charlie@example.com",
			name: "Charlie Brown",
			phoneNumber: null,
		},
	];

	beforeAll(async () => {
		await db.insert(customersTable).values(testCustomers);
	});

	afterAll(async () => {
		await db.delete(customersTable).where(
			inArray(
				customersTable.customerId,
				testCustomers.map((c) => c.customerId),
			),
		);
	});

	test("全顧客を取得できる", async () => {
		const result = await getCustomers({ keyword: "", page: 1, perPage: 20 });

		expect(result.customers.length).toBeGreaterThanOrEqual(3);
		expect(result.totalCount).toBeGreaterThanOrEqual(3);
	});

	test("名前で検索できる", async () => {
		const result = await getCustomers({
			keyword: "Alice",
			page: 1,
			perPage: 20,
		});

		expect(result.customers.length).toBeGreaterThanOrEqual(1);
		expect(result.customers.some((c) => c.name === "Alice Smith")).toBe(true);
	});

	test("メールアドレスで検索できる", async () => {
		const result = await getCustomers({
			keyword: "bob@example.com",
			page: 1,
			perPage: 20,
		});

		expect(result.customers.length).toBeGreaterThanOrEqual(1);
		expect(result.customers.some((c) => c.email === "bob@example.com")).toBe(
			true,
		);
	});

	test("電話番号で検索できる", async () => {
		const result = await getCustomers({
			keyword: "090-1234",
			page: 1,
			perPage: 20,
		});

		expect(result.customers.length).toBeGreaterThanOrEqual(1);
		expect(
			result.customers.some((c) => c.phoneNumber === "090-1234-5678"),
		).toBe(true);
	});

	test("ページネーションが正しく動作する", async () => {
		const page1 = await getCustomers({ keyword: "", page: 1, perPage: 2 });
		const page2 = await getCustomers({ keyword: "", page: 2, perPage: 2 });

		expect(page1.currentPage).toBe(1);
		expect(page2.currentPage).toBe(2);
		expect(page1.customers.length).toBeLessThanOrEqual(2);
		expect(page2.customers.length).toBeLessThanOrEqual(2);
	});

	test("検索結果が0件の場合", async () => {
		const result = await getCustomers({
			keyword: "nonexistent-customer-xyz",
			page: 1,
			perPage: 20,
		});

		expect(result.customers.length).toBe(0);
		expect(result.totalCount).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});

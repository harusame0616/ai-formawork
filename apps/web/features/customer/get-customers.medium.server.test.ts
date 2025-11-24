import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { getCustomers } from "./get-customers";

// Next.jsのキャッシュAPIをモック
vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

const test = base.extend<{
	customer: {
		customerId: string;
		email: string;
		name: string;
		phone: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "_".
	async customer({}, use) {
		const customer = {
			customerId: v4(),
			email: `${v4()}@example.com`,
			name: v4().slice(0, 24),
			phone: `${Math.floor(Math.random() * 1000000000)}`,
		};

		await db.insert(customersTable).values(customer);
		await use(customer);
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customer.customerId));
	},
});

test("複数フィールドにマッチする検索ができる", async ({ customer }) => {
	const emailSearchResult = await getCustomers({
		keyword: customer.email,
	});
	const nameSearchResult = await getCustomers({
		keyword: customer.name,
	});
	const phoneSearchResult = await getCustomers({
		keyword: customer.phone,
	});

	expect(emailSearchResult.customers.length).toBe(1);
	expect(nameSearchResult.customers.length).toBe(1);
	expect(phoneSearchResult.customers.length).toBe(1);
});

test("大文字小文字を区別せずに検索できる", async ({ customer }) => {
	const emailSearchResult = await getCustomers({
		keyword: customer.email.toUpperCase(),
	});
	const nameSearchResult = await getCustomers({
		keyword: customer.name.toUpperCase(),
	});
	const phoneSearchResult = await getCustomers({
		keyword: customer.phone.toUpperCase(),
	});

	expect(emailSearchResult.customers.length).toBe(1);
	expect(nameSearchResult.customers.length).toBe(1);
	expect(phoneSearchResult.customers.length).toBe(1);
});

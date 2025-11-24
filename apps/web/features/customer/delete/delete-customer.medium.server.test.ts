import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteCustomer } from "./delete-customer";

// Loggerをモック
vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
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

test("存在しない顧客を削除しようとした場合にエラーが返される", async () => {
	const nonExistentCustomerId = "99999999-9999-9999-9999-999999999999";

	const result = await deleteCustomer({
		customerId: nonExistentCustomerId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定された顧客が見つかりません");
	}
});

test("存在する顧客を削除できる", async ({ customer }) => {
	const result = await deleteCustomer({
		customerId: customer.customerId,
	});

	expect(result.success).toBe(true);

	// 削除されたことを確認
	const [deletedCustomer] = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.customerId, customer.customerId))
		.limit(1);

	expect(deletedCustomer).toBeUndefined();
});

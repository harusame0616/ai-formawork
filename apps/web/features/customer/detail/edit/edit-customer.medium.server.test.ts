import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { expect, test, vi } from "vitest";
import { editCustomer } from "./edit-customer";

// Loggerをモック
vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

test("存在しない顧客IDを指定した場合にエラーが返される", async () => {
	const nonExistentCustomerId = "99999999-9999-9999-9999-999999999999";

	const result = await editCustomer({
		customerId: nonExistentCustomerId,
		email: "test@example.com",
		name: "テスト",
		phone: "090-0000-0000",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定された顧客が見つかりません");
	}
});

test("nullを指定してフィールドをクリアできる", async () => {
	// seed データの最初の顧客
	const customerId = "00000000-0000-0000-0000-000000000001";

	const result = await editCustomer({
		customerId,
		email: null,
		name: "nullテスト",
		phone: null,
	});

	expect(result.success).toBe(true);

	// DBから取得して確認
	const customer = await db.query.customersTable.findFirst({
		where: eq(customersTable.customerId, customerId),
	});

	expect(customer).toBeDefined();
	expect(customer?.name).toBe("nullテスト");
	expect(customer?.email).toBeNull();
	expect(customer?.phone).toBeNull();
});

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

import { expect, test, vi } from "vitest";
import { registerCustomerAction } from "./register-customer-action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("./register-customer", () => ({
	registerCustomer: vi.fn(),
}));

test("メール形式が不正な場合にバリデーションエラーを返す", async () => {
	const { registerCustomer } = await import("./register-customer");

	const input = {
		email: "invalid-email",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await registerCustomerAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerCustomer).not.toHaveBeenCalled();
});

test("name が25文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerCustomer } = await import("./register-customer");
	const input = {
		email: "test@example.com",
		name: "あ".repeat(25),
		phone: "",
	};

	const result = await registerCustomerAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerCustomer).not.toHaveBeenCalled();
});

test("email が255文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerCustomer } = await import("./register-customer");
	const input = {
		email: `${"a".repeat(243)}@example.com`,
		name: "テスト太郎",
		phone: "",
	};

	const result = await registerCustomerAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerCustomer).not.toHaveBeenCalled();
});

test("phone が21文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerCustomer } = await import("./register-customer");
	const input = {
		email: "test@example.com",
		name: "テスト太郎",
		phone: "0".repeat(21),
	};

	const result = await registerCustomerAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerCustomer).not.toHaveBeenCalled();
});

test("登録処理でエラーが発生した場合にエラーメッセージを返す", async () => {
	const { registerCustomer } = await import("./register-customer");

	vi.mocked(registerCustomer).mockRejectedValue(new Error("Database error"));

	const input = {
		email: "test@example.com",
		name: "テスト太郎",
		phone: "09012345678",
	};

	const result = await registerCustomerAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe(
			"サーバーエラーが発生しました。時間をおいて再度お試しください",
		);
	}
});

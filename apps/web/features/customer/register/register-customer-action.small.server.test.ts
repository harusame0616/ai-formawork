import { test as base, expect, type Mock, vi } from "vitest";
import { registerCustomerAction } from "./register-customer-action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
	const actual = await importOriginal<typeof import("next/navigation")>();
	return {
		...actual,
		redirect: vi.fn(),
	};
});

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("@/features/auth/get-user-staff-id", () => ({
	getUserStaffId: vi.fn(),
}));

vi.mock("@/features/auth/get-user-role", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/features/auth/get-user-role")>();
	return {
		...actual,
		getUserRole: vi.fn(),
	};
});

vi.mock("./register-customer", () => ({
	registerCustomer: vi.fn(),
}));

const test = base.extend<{
	getUserStaffIdMock: Mock;
	getUserRoleMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserRoleMock: async ({}, use: any) => {
		const getUserRoleModule = await import("@/features/auth/get-user-role");
		const mock = vi.mocked(getUserRoleModule.getUserRole);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserStaffIdMock: async ({}, use: any) => {
		const getUserStaffIdModule = await import(
			"@/features/auth/get-user-staff-id"
		);
		const mock = vi.mocked(getUserStaffIdModule.getUserStaffId);
		await use(mock);
		vi.clearAllMocks();
	},
});

const validInput = {
	email: "test@example.com",
	name: "テスト太郎",
	phone: "09012345678",
};

test("一般ユーザーロールの場合、権限エラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("user");

	const result = await registerCustomerAction(validInput);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}
});

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue(null);

	const result = await registerCustomerAction(validInput);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("メール形式が不正な場合にバリデーションエラーを返す", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { registerCustomer } = await import("./register-customer");
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

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

test("name が25文字（境界値超過）の場合にバリデーションエラーを返す", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { registerCustomer } = await import("./register-customer");
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

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

test("email が255文字（境界値超過）の場合にバリデーションエラーを返す", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { registerCustomer } = await import("./register-customer");
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

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

test("phone が21文字（境界値超過）の場合にバリデーションエラーを返す", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { registerCustomer } = await import("./register-customer");
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

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

test("登録処理でエラーが発生した場合にエラーメッセージを返す", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const { registerCustomer } = await import("./register-customer");
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

	vi.mocked(registerCustomer).mockRejectedValue(new Error("Database error"));

	const result = await registerCustomerAction(validInput);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe(
			"サーバーエラーが発生しました。時間をおいて再度お試しください",
		);
	}
});

import { test as base, expect, type Mock, vi } from "vitest";
import { editCustomerAction } from "./edit-customer-action";

vi.mock("next/cache", async () => ({
	updateTag: vi.fn(),
}));

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

vi.mock("./edit-customer", () => ({
	editCustomer: vi.fn(),
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
	customerId: "00000000-0000-0000-0000-000000000001",
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

	const result = await editCustomerAction(validInput);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}
});

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue(null);

	const result = await editCustomerAction(validInput);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("不正なcustomerIdの場合、バリデーションエラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

	const result = await editCustomerAction({
		...validInput,
		customerId: "invalid-uuid",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});

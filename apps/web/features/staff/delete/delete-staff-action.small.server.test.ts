import { test as base, expect, type Mock, vi } from "vitest";
import { deleteStaffAction } from "./delete-staff-action";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
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

test("一般ユーザーロールの場合、権限エラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	const testStaffId = "00000000-0000-0000-0000-000000000001";

	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("user");

	const result = await deleteStaffAction({
		staffId: testStaffId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("この操作を実行する権限がありません");
	}
});

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	const testStaffId = "00000000-0000-0000-0000-000000000001";

	getUserStaffIdMock.mockResolvedValue(null);

	const result = await deleteStaffAction({
		staffId: testStaffId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("不正なstaffIdの場合、バリデーションエラーが返される", async ({
	getUserStaffIdMock,
	getUserRoleMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	getUserRoleMock.mockResolvedValue("admin");

	const result = await deleteStaffAction({
		staffId: "invalid-uuid",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});

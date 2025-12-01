import { RedirectType } from "next/navigation";
import { test as base, expect, type Mock, vi } from "vitest";
import { changePasswordAction } from "./change-password-action";

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

vi.mock("@/features/auth/get-user-role", () => ({
	getUserRole: vi.fn(),
}));

vi.mock("./change-password", () => ({
	changePassword: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
	const actual = await importOriginal<typeof import("next/navigation")>();
	return {
		...actual,
		redirect: vi.fn(),
	};
});

const test = base.extend<{
	getUserStaffIdMock: Mock;
	changePasswordMock: Mock;
	redirectMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	changePasswordMock: async ({}, use: any) => {
		const module = await import("./change-password");
		const mock = vi.mocked(module.changePassword);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	getUserStaffIdMock: async ({}, use: any) => {
		const module = await import("@/features/auth/get-user-staff-id");
		const mock = vi.mocked(module.getUserStaffId);
		await use(mock);
		vi.clearAllMocks();
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	redirectMock: async ({}, use: any) => {
		const module = await import("next/navigation");
		const mock = vi.mocked(module.redirect);
		await use(mock);
		vi.clearAllMocks();
	},
});

test.each([
	{ description: "引数が undefined", input: undefined },
	{ description: "引数が null", input: null },
	{ description: "引数が数値", input: 123 },
	{ description: "引数が配列", input: [] },
	{ description: "引数が空オブジェクト", input: {} },
	{
		description: "currentPassword プロパティが欠けている",
		input: { newPassword: "NewPass@123" },
	},
	{
		description: "newPassword プロパティが欠けている",
		input: { currentPassword: "Current@123" },
	},
	{
		description: "currentPassword が数値",
		input: { currentPassword: 123, newPassword: "NewPass@123" },
	},
	{
		description: "newPassword が数値",
		input: { currentPassword: "Current@123", newPassword: 123 },
	},
	{
		description: "currentPassword が空文字列",
		input: { currentPassword: "", newPassword: "NewPass@123" },
	},
	{
		description: "newPassword が空文字列",
		input: { currentPassword: "Current@123", newPassword: "" },
	},
	{
		description: "newPassword が7文字（8文字未満）",
		input: { currentPassword: "Current@123", newPassword: "Short@1" },
	},
	{
		description: "currentPassword が65文字（64文字超過）",
		input: {
			currentPassword: "a".repeat(65),
			newPassword: "NewPass@123",
		},
	},
	{
		description: "newPassword が65文字（64文字超過）",
		input: {
			currentPassword: "Current@123",
			newPassword: "a".repeat(65),
		},
	},
	{
		description: "currentPassword と newPassword が同じ",
		input: {
			currentPassword: "SamePass@123",
			newPassword: "SamePass@123",
		},
	},
])("$description の場合、バリデーションエラーを返す", async ({ input }) => {
	// @ts-expect-error - サーバーアクションは任意の引数で呼び出される可能性がある
	const result = await changePasswordAction(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
});

test("currentPassword が64文字（境界値）の場合、changePassword が呼び出される", async ({
	getUserStaffIdMock,
	changePasswordMock,
}) => {
	const input = {
		currentPassword: "a".repeat(64),
		newPassword: "NewPass@123",
	};
	getUserStaffIdMock.mockResolvedValue("staff-id");
	changePasswordMock.mockResolvedValue({ data: undefined, success: true });

	await changePasswordAction(input);

	expect(changePasswordMock).toHaveBeenCalledWith(input, expect.anything());
});

test("newPassword が8文字（境界値）の場合、changePassword が呼び出される", async ({
	getUserStaffIdMock,
	changePasswordMock,
}) => {
	const input = {
		currentPassword: "Current@123",
		newPassword: "Pass@123",
	};
	getUserStaffIdMock.mockResolvedValue("staff-id");
	changePasswordMock.mockResolvedValue({ data: undefined, success: true });

	await changePasswordAction(input);

	expect(changePasswordMock).toHaveBeenCalledWith(input, expect.anything());
});

test("newPassword が64文字（境界値）の場合、changePassword が呼び出される", async ({
	getUserStaffIdMock,
	changePasswordMock,
}) => {
	const input = {
		currentPassword: "Current@123",
		newPassword: "a".repeat(64),
	};
	getUserStaffIdMock.mockResolvedValue("staff-id");
	changePasswordMock.mockResolvedValue({ data: undefined, success: true });

	await changePasswordAction(input);

	expect(changePasswordMock).toHaveBeenCalledWith(input, expect.anything());
});

test("認証されていない場合、認証エラーが返される", async ({
	getUserStaffIdMock,
}) => {
	getUserStaffIdMock.mockResolvedValue(null);

	const result = await changePasswordAction({
		currentPassword: "Current@123",
		newPassword: "NewPass@123",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証に失敗しました");
	}
});

test("changePassword がエラーを返す場合、そのエラーがそのまま返される", async ({
	getUserStaffIdMock,
	changePasswordMock,
}) => {
	const testError = "テストエラー";
	getUserStaffIdMock.mockResolvedValue("staff-id");
	changePasswordMock.mockResolvedValue({
		error: testError,
		success: false,
	});

	const result = await changePasswordAction({
		currentPassword: "Current@123",
		newPassword: "NewPass@123",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe(testError);
	}
});

test("パスワード変更が成功した場合、ホームにリダイレクトされる", async ({
	getUserStaffIdMock,
	changePasswordMock,
	redirectMock,
}) => {
	getUserStaffIdMock.mockResolvedValue("staff-id");
	changePasswordMock.mockResolvedValue({ data: undefined, success: true });

	await changePasswordAction({
		currentPassword: "Current@123",
		newPassword: "NewPass@123",
	});

	expect(redirectMock).toHaveBeenCalledWith("/", RedirectType.replace);
});

import { expect, test, vi } from "vitest";
import { registerStaffAction } from "./register-staff-action";

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
	getUserStaffId: vi.fn().mockResolvedValue("test-staff-id"),
}));

vi.mock("@/features/auth/get-user-role", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/features/auth/get-user-role")>();
	return {
		...actual,
		getUserRole: vi.fn().mockResolvedValue("admin"),
	};
});

vi.mock("./register-staff", () => ({
	registerStaff: vi.fn(),
}));

test("姓が空の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "",
		lastName: "山田",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("名が空の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "太郎",
		lastName: "",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("メール形式が不正な場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "invalid-email",
		firstName: "太郎",
		lastName: "山田",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("パスワードが8文字未満の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "太郎",
		lastName: "山田",
		password: "1234567",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("firstName が25文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "あ".repeat(25),
		lastName: "山田",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("lastName が25文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "太郎",
		lastName: "あ".repeat(25),
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("email が255文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: `${"a".repeat(243)}@example.com`,
		firstName: "太郎",
		lastName: "山田",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("password が129文字（境界値超過）の場合にバリデーションエラーを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	const input = {
		email: "test@example.com",
		firstName: "太郎",
		lastName: "山田",
		password: "a".repeat(129),
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe("入力内容に誤りがあります");
	}
	expect(registerStaff).not.toHaveBeenCalled();
});

test("登録処理でエラーが発生した場合にエラーメッセージを返す", async () => {
	const { registerStaff } = await import("./register-staff");

	vi.mocked(registerStaff).mockRejectedValue(new Error("Database error"));

	const input = {
		email: "test@example.com",
		firstName: "太郎",
		lastName: "山田",
		password: "password123",
		role: "user" as const,
	};

	const result = await registerStaffAction(input);

	expect(result).toBeDefined();
	expect(result?.success).toBe(false);
	if (result && !result.success) {
		expect(result.error).toBe(
			"サーバーエラーが発生しました。時間をおいて再度お試しください",
		);
	}
});

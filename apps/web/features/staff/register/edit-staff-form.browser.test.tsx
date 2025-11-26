import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { EditStaffForm } from "./edit-staff-form";

vi.mock("./register-staff-action", () => ({
	registerStaffAction: vi.fn(),
}));

const test = base.extend<{
	registerStaffActionMock: Mock;
}>({
	registerStaffActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const registerStaffActionModule = await import("./register-staff-action");
		await use(registerStaffActionModule.registerStaffAction);
		vi.clearAllMocks();
	},
});

test("名前が空の場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("名前を入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスが空の場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(
			page.getByText("メールアドレスを入力してください", { exact: true }),
		)
		.toBeInTheDocument();
});

test("メールアドレスの形式が不正な場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("invalid-email");
	await page.getByRole("textbox", { name: "パスワード" }).fill("password123");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("正しいメールアドレス形式で入力してください"))
		.toBeInTheDocument();
});

test("パスワードが空の場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("パスワードを入力してください"))
		.toBeInTheDocument();
});

test("パスワードが8文字未満の場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("1234567");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("パスワードは8文字以上で入力してください"))
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	registerStaffActionMock,
}) => {
	registerStaffActionMock.mockReturnValue(new Promise(() => {}));

	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("password123");
	await page.getByRole("button", { name: "登録する" }).click();

	const button = page.getByRole("button", { name: /登録中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("登録中...")).toBeInTheDocument();
});

test("登録エラー時にエラーメッセージが表示される", async ({
	registerStaffActionMock,
}) => {
	registerStaffActionMock.mockResolvedValue({
		error: "このメールアドレスは既に登録されています",
		success: false,
	});

	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("password123");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect.element(page.getByRole("alert")).toBeInTheDocument();
	await expect
		.element(page.getByText("このメールアドレスは既に登録されています"))
		.toBeInTheDocument();
});

test("名前が25文字（最大値24文字を超える）場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page
		.getByLabelText("名前")
		.fill("あいうえおかきくけこさしすせそたちつてとなにぬねのは");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("password123");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("名前は24文字以内で入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスが255文字（最大値254文字を超える）場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	const longEmail = `${"a".repeat(64)}@${"example-".repeat(22)}example123.com`;
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill(longEmail);
	await page.getByRole("textbox", { name: "パスワード" }).fill("password123");
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.toBeInTheDocument();
});

test("パスワードが129文字（最大値128文字を超える）場合、エラーが表示される", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("test@example.com");
	await page.getByRole("textbox", { name: "パスワード" }).fill("a".repeat(129));
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("パスワードは128文字以内で入力してください"))
		.toBeInTheDocument();
});

test("ロールはデフォルトで一般が選択されている", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	const userRadio = page.getByRole("radio", { name: "一般" });
	await expect.element(userRadio).toBeChecked();
});

test("ロールを管理者に変更できる", async () => {
	render(<EditStaffForm />);

	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	await page.getByRole("radio", { name: "管理者" }).click();

	const adminRadio = page.getByRole("radio", { name: "管理者" });
	await expect.element(adminRadio).toBeChecked();
});

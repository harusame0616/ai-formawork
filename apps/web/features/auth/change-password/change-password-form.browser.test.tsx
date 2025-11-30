import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ChangePasswordForm } from "./change-password-form";

vi.mock("./change-password-action", () => ({
	changePasswordAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		back: vi.fn(),
	}),
}));

const test = base.extend<{
	changePasswordActionMock: Mock;
}>({
	changePasswordActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const changePasswordActionModule = await import("./change-password-action");
		await use(changePasswordActionModule.changePasswordAction);
		vi.clearAllMocks();
	},
});

test("現在のパスワードが空の場合、エラーが表示される", async () => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("新しいパスワード").fill("New@Pass123");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("現在のパスワードを入力してください"))
		.toBeInTheDocument();
});

test("新しいパスワードが空の場合、エラーが表示される", async () => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("新しいパスワードを入力してください"))
		.toBeInTheDocument();
});

test("新しいパスワードが8文字未満の場合、エラーが表示される", async () => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByLabelText("新しいパスワード").fill("1234567");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("パスワードは8文字以上で入力してください"))
		.toBeInTheDocument();
});

test("新しいパスワードが64文字を超える場合、エラーが表示される", async () => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByLabelText("新しいパスワード").fill("a".repeat(65));
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("パスワードは64文字以内で入力してください"))
		.toBeInTheDocument();
});

test("現在のパスワードと新しいパスワードが同じ場合、エラーが表示される", async () => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Same@Pass123");
	await page.getByLabelText("新しいパスワード").fill("Same@Pass123");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(
			page.getByText(
				"新しいパスワードは現在のパスワードと異なるものを入力してください",
			),
		)
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	changePasswordActionMock,
}) => {
	changePasswordActionMock.mockReturnValue(new Promise(() => {}));

	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByLabelText("新しいパスワード").fill("New@Pass123");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	const button = page.getByRole("button", { name: /変更中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("変更中...")).toBeInTheDocument();
});

test("現在のパスワードが64文字を超える場合、エラーが表示される", async ({
	changePasswordActionMock,
}) => {
	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("a".repeat(65));
	await page.getByLabelText("新しいパスワード").fill("New@Pass123");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("パスワードは64文字以内で入力してください"))
		.toBeInTheDocument();

	expect(changePasswordActionMock).not.toHaveBeenCalled();
});

test("新しいパスワードが8文字（境界値）の場合、送信できる", async ({
	changePasswordActionMock,
}) => {
	changePasswordActionMock.mockResolvedValue({
		success: true,
	});

	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByLabelText("新しいパスワード").fill("12345678");
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("パスワードは8文字以上で入力してください"))
		.not.toBeInTheDocument();

	expect(changePasswordActionMock).toHaveBeenCalled();
});

test("新しいパスワードが64文字（境界値）の場合、送信できる", async ({
	changePasswordActionMock,
}) => {
	changePasswordActionMock.mockResolvedValue({
		success: true,
	});

	render(<ChangePasswordForm />);

	await page.getByLabelText("現在のパスワード").fill("Current@Pass123");
	await page.getByLabelText("新しいパスワード").fill("a".repeat(64));
	await page.getByRole("button", { name: "パスワードを変更" }).click();

	await expect
		.element(page.getByText("パスワードは64文字以内で入力してください"))
		.not.toBeInTheDocument();

	expect(changePasswordActionMock).toHaveBeenCalled();
});

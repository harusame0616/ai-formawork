import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { LoginForm } from "./login-form";

// loginAction をモック
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

const test = base.extend<{
	loginActionMock: Mock;
}>({
	loginActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const loginActionModule = await import("./login-action");
		await use(loginActionModule.loginAction);
		vi.clearAllMocks();
	},
});

test("メールアドレスが空の場合、バリデーションエラーが表示される", async () => {
	render(<LoginForm />);

	// パスワードだけを入力
	await page.getByLabelText(/^パスワード$/).fill("Test@Pass123");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "ログイン" }).click();

	await expect
		.element(page.getByText("メールアドレスを入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスの形式が不正な場合、バリデーションエラーが表示される", async () => {
	render(<LoginForm />);

	// 不正な形式のメールアドレスを入力
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("invalid-email");

	await page.getByLabelText(/^パスワード$/).fill("Test@Pass123");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "ログイン" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("有効なメールアドレスを入力してください"))
		.toBeInTheDocument();
});

test("パスワードが空の場合、バリデーションエラーが表示される", async () => {
	render(<LoginForm />);

	// メールアドレスだけを入力
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "ログイン" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("パスワードを入力してください"))
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	loginActionMock,
}) => {
	loginActionMock.mockReturnValue(new Promise(() => {}));

	render(<LoginForm />);

	// 有効な入力
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	await page.getByLabelText(/^パスワード$/).fill("Test@Pass123");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "ログイン" }).click();

	// 送信中の状態を確認
	const button = page.getByRole("button", { name: /ログイン中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("ログイン中...")).toBeInTheDocument();
});

test("認証エラー時にエラーメッセージが表示される", async ({
	loginActionMock,
}) => {
	// loginAction がエラーを返すようにモック
	loginActionMock.mockResolvedValue({
		error: "認証に失敗しました",
		success: false,
	});

	render(<LoginForm />);

	// 有効な入力
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	await page.getByLabelText(/^パスワード$/).fill("Test@Pass123");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "ログイン" }).click();

	// エラーメッセージが表示されることを確認
	await expect.element(page.getByRole("alert")).toBeInTheDocument();
	await expect
		.element(page.getByText("認証に失敗しました"))
		.toBeInTheDocument();
});

test("パスワード表示切替ボタンで表示/非表示を切り替えられる", async () => {
	render(<LoginForm />);

	const passwordInput = page.getByLabelText(/^パスワード$/);

	// 初期状態はtype="password"
	await expect.element(passwordInput).toHaveAttribute("type", "password");

	// 表示ボタンをクリック
	const toggleButton = page.getByRole("button", { name: "パスワードを表示" });
	await toggleButton.click();

	// type="text"に変わり、ボタンのaria-labelが変わる
	await expect.element(passwordInput).toHaveAttribute("type", "text");
	await expect
		.element(page.getByRole("button", { name: "パスワードを隠す" }))
		.toBeInTheDocument();

	// 非表示に戻す
	const hideButton = page.getByRole("button", { name: "パスワードを隠す" });
	await hideButton.click();

	// type="password"に戻り、ボタンのaria-labelが元に戻る
	await expect.element(passwordInput).toHaveAttribute("type", "password");
	await expect
		.element(page.getByRole("button", { name: "パスワードを表示" }))
		.toBeInTheDocument();
});

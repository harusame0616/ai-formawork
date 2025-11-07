import type { Result } from "@harusame0616/result";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as loginActionModule from "./login-action";
import { LoginForm } from "./login-form";

// Server Actionをモック
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

// next/navigationをモック（redirect関数が使用されるため）
vi.mock("next/navigation", () => ({
	RedirectType: {
		push: "push",
		replace: "replace",
	},
	redirect: vi.fn(),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	test("初期状態で全てのフィールドが表示される", async () => {
		render(<LoginForm />);

		expect(
			screen.getByRole("textbox", { name: "メールアドレス" }),
		).toBeDefined();
		expect(screen.getByLabelText("パスワード")).toBeDefined();
		expect(screen.getByRole("button", { name: "ログイン" })).toBeDefined();
	});

	test("メールアドレスが空の場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// パスワードのみ入力
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("メールアドレスを入力してください"),
			).toBeDefined();
		});
	});

	test("パスワードが空の場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// メールアドレスのみ入力
		await user.type(emailInput, "test@example.com");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(screen.getByText("パスワードを入力してください")).toBeDefined();
		});
	});

	test("不正な形式のメールアドレスの場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 不正な形式のメールアドレスを入力
		await user.type(emailInput, "invalid-email");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("有効なメールアドレスを入力してください"),
			).toBeDefined();
		});
	});

	test("フォーム送信中はボタンが無効化され、ローディング表示される", async () => {
		const user = userEvent.setup();

		// Server Actionが解決されないPromiseを返すようにモック（送信中状態をシミュレート）
		let resolveAction: (value: Result<never, string>) => void;
		const pendingPromise = new Promise<Result<never, string>>((resolve) => {
			resolveAction = resolve;
		});
		vi.mocked(loginActionModule.loginAction).mockReturnValue(pendingPromise);

		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 有効な認証情報を入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// 送信中の状態を確認
		await waitFor(() => {
			const loadingButton = screen.getByRole("button", {
				name: "ログイン中...",
			});
			expect(loadingButton).toBeDefined();
			expect(loadingButton.getAttribute("disabled")).toBe("");
		});

		// クリーンアップ：Promise を解決
		resolveAction?.({ success: true, value: undefined as never });
	});

	test("Server Actionがエラーを返した場合、エラーメッセージが表示される", async () => {
		const user = userEvent.setup();
		const errorMessage = "認証に失敗しました";

		// Server Actionがエラーを返すようにモック
		vi.mocked(loginActionModule.loginAction).mockResolvedValue({
			error: errorMessage,
			success: false,
		});

		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 認証情報を入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "WrongPassword");
		await user.click(submitButton);

		// エラーメッセージを確認
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeDefined();
			expect(screen.getByText(errorMessage)).toBeDefined();
		});
	});

	test("エラー後に再送信する場合、前回のエラーメッセージがクリアされる", async () => {
		const user = userEvent.setup();
		const firstErrorMessage = "最初のエラー";
		const secondErrorMessage = "2回目のエラー";

		// 最初のエラー
		vi.mocked(loginActionModule.loginAction).mockResolvedValueOnce({
			error: firstErrorMessage,
			success: false,
		});

		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 最初の送信
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "WrongPassword1");
		await user.click(submitButton);

		// 最初のエラーメッセージを確認
		await waitFor(() => {
			expect(screen.getByText(firstErrorMessage)).toBeDefined();
		});

		// 2回目のエラー
		vi.mocked(loginActionModule.loginAction).mockResolvedValueOnce({
			error: secondErrorMessage,
			success: false,
		});

		// 2回目の送信
		await user.clear(passwordInput);
		await user.type(passwordInput, "WrongPassword2");
		await user.click(submitButton);

		// 2回目のエラーメッセージを確認し、最初のエラーがクリアされていることを確認
		await waitFor(() => {
			expect(screen.getByText(secondErrorMessage)).toBeDefined();
			expect(screen.queryByText(firstErrorMessage)).toBeNull();
		});
	});

	test("入力フィールドに適切なautoComplete属性が設定されている", () => {
		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");

		expect(emailInput.getAttribute("autocomplete")).toBe("username");
		expect(passwordInput.getAttribute("autocomplete")).toBe("current-password");
	});

	test("パスワードフィールドのtype属性がpasswordである", () => {
		render(<LoginForm />);

		const passwordInput = screen.getByLabelText("パスワード");
		expect(passwordInput.getAttribute("type")).toBe("password");
	});

	test("メールアドレスフィールドのtype属性がemailである", () => {
		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		expect(emailInput.getAttribute("type")).toBe("email");
	});

	test("両方のフィールドが空の場合、両方のバリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 何も入力せずに送信
		await user.click(submitButton);

		// 両方のバリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("メールアドレスを入力してください"),
			).toBeDefined();
			expect(screen.getByText("パスワードを入力してください")).toBeDefined();
		});
	});

	test("Server Actionがバリデーションエラーを返した場合、エラーメッセージが表示される", async () => {
		const user = userEvent.setup();
		const validationErrorMessage = "入力内容に誤りがあります";

		// Server Actionがバリデーションエラーを返すようにモック
		vi.mocked(loginActionModule.loginAction).mockResolvedValue({
			error: validationErrorMessage,
			success: false,
		});

		render(<LoginForm />);

		const emailInput = screen.getByRole("textbox", {
			name: "メールアドレス",
		});
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 認証情報を入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password");
		await user.click(submitButton);

		// エラーメッセージを確認
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeDefined();
			expect(screen.getByText(validationErrorMessage)).toBeDefined();
		});
	});
});

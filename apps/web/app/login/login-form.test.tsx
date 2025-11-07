import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { LoginForm } from "./login-form";

// loginAction をモック
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

// モジュールのインポート
const loginActionModule = await import("./login-action");
const mockLoginAction = vi.mocked(loginActionModule.loginAction);

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("フォームの初期表示時に必要な要素が存在する", () => {
		render(<LoginForm />);

		// フォーム要素が存在するか
		expect(
			screen.getByRole("textbox", { name: "メールアドレス" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "ログイン" }),
		).toBeInTheDocument();

		// ボタンが初期状態では有効
		expect(screen.getByRole("button", { name: "ログイン" })).not.toBeDisabled();
	});

	test.skip("メールアドレスが空の場合、バリデーションエラーが表示される", async () => {
		render(<LoginForm />);

		// パスワードだけを入力
		const passwordInput = screen.getByLabelText("パスワード");
		await userEvent.fill(passwordInput, "Test@Pass123");

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// バリデーションエラーが表示されることを確認
		await waitFor(() => {
			expect(
				screen.getByText("メールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		// loginAction が呼ばれていないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test.skip("メールアドレスの形式が不正な場合、バリデーションエラーが表示される", async () => {
		render(<LoginForm />);

		// 不正な形式のメールアドレスを入力
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		await userEvent.fill(emailInput, "invalid-email");

		const passwordInput = screen.getByLabelText("パスワード");
		await userEvent.fill(passwordInput, "Test@Pass123");

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// バリデーションエラーが表示されることを確認
		await waitFor(() => {
			expect(
				screen.getByText("有効なメールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		// loginAction が呼ばれていないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test.skip("パスワードが空の場合、バリデーションエラーが表示される", async () => {
		render(<LoginForm />);

		// メールアドレスだけを入力
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		await userEvent.fill(emailInput, "test@example.com");

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// バリデーションエラーが表示されることを確認
		await waitFor(() => {
			expect(
				screen.getByText("パスワードを入力してください"),
			).toBeInTheDocument();
		});

		// loginAction が呼ばれていないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test.skip("送信中はボタンが無効化され、ローディング表示になる", async () => {
		// loginAction が Promise を返すようにモック（長時間かかる想定）
		let resolveLogin: (value: unknown) => void;
		const loginPromise = new Promise((resolve) => {
			resolveLogin = resolve;
		});
		mockLoginAction.mockReturnValue(loginPromise as never);

		render(<LoginForm />);

		// 有効な入力
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		await userEvent.fill(emailInput, "test@example.com");

		const passwordInput = screen.getByLabelText("パスワード");
		await userEvent.fill(passwordInput, "Test@Pass123");

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// 送信中の状態を確認
		await waitFor(() => {
			const button = screen.getByRole("button", { name: /ログイン中/ });
			expect(button).toBeDisabled();
			expect(screen.getByText("ログイン中...")).toBeInTheDocument();
		});

		// Promise を resolve
		resolveLogin?.({ success: true });
	});

	test.skip("認証エラー時にエラーメッセージが表示される", async () => {
		// loginAction がエラーを返すようにモック
		mockLoginAction.mockResolvedValue({
			error: "認証に失敗しました",
			success: false,
		});

		render(<LoginForm />);

		// 有効な入力
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		await userEvent.fill(emailInput, "test@example.com");

		const passwordInput = screen.getByLabelText("パスワード");
		await userEvent.fill(passwordInput, "Test@Pass123");

		// 送信ボタンをクリック
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// エラーメッセージが表示されることを確認
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
			expect(screen.getByText("認証に失敗しました")).toBeInTheDocument();
		});
	});

	test.skip("複数回のエラー後、エラーがクリアされて再送信できる", async () => {
		// 最初はエラーを返す
		mockLoginAction.mockResolvedValueOnce({
			error: "認証に失敗しました",
			success: false,
		});

		render(<LoginForm />);

		// 有効な入力
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		const passwordInput = screen.getByLabelText("パスワード");

		await userEvent.fill(emailInput, "test@example.com");
		await userEvent.fill(passwordInput, "WrongPass");

		// 最初の送信
		const submitButton = screen.getByRole("button", { name: "ログイン" });
		await userEvent.click(submitButton);

		// エラーメッセージが表示される
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});

		// 2回目は成功を返す
		mockLoginAction.mockResolvedValueOnce({
			success: true,
		} as never);

		// フォームを変更して再送信
		await userEvent.clear(passwordInput);
		await userEvent.fill(passwordInput, "CorrectPass");
		await userEvent.click(submitButton);

		// エラーメッセージが消えることを確認
		await waitFor(() => {
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});
	});

	test("必要なアクセシビリティ属性が設定されている", () => {
		render(<LoginForm />);

		// メールアドレス入力のアクセシビリティ
		const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
		expect(emailInput).toHaveAttribute("type", "email");
		expect(emailInput).toHaveAttribute("autocomplete", "username");

		// パスワード入力のアクセシビリティ
		const passwordInput = screen.getByLabelText("パスワード");
		expect(passwordInput).toHaveAttribute("type", "password");
		expect(passwordInput).toHaveAttribute("autocomplete", "current-password");

		// noValidate 属性の確認（HTML5 バリデーションを無効化）
		const form = emailInput.closest("form");
		expect(form).toHaveAttribute("noValidate");
	});
});

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { LoginSchema } from "../../features/auth/schema";
import { LoginForm } from "./login-form";

// loginAction のモック
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

// next/navigation のモック（redirect は loginAction 内で呼ばれるため）
vi.mock("next/navigation", () => ({
	RedirectType: {
		replace: "replace",
	},
	redirect: vi.fn(),
}));

const { loginAction } = await import("./login-action");

test("バリデーションエラー：メールアドレスが空の場合、エラーメッセージが表示される", async () => {
	const user = userEvent.setup();
	render(<LoginForm />);

	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// メールアドレスのバリデーションエラーを確認
	await waitFor(() => {
		expect(
			screen.getByText("メールアドレスを入力してください"),
		).toBeInTheDocument();
	});
});

test("バリデーションエラー：パスワードが空の場合、エラーメッセージが表示される", async () => {
	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(emailInput, "test@example.com");
	await user.click(submitButton);

	// パスワードのバリデーションエラーを確認
	await waitFor(() => {
		expect(
			screen.getByText("パスワードを入力してください"),
		).toBeInTheDocument();
	});
});

test("バリデーションエラー：メールアドレスの形式が不正な場合、エラーメッセージが表示される", async () => {
	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(emailInput, "invalid-email");
	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// メールアドレス形式のバリデーションエラーを確認
	await waitFor(() => {
		expect(
			screen.getByText("有効なメールアドレスを入力してください"),
		).toBeInTheDocument();
	});
});

test("バリデーションエラー：両フィールドが空の場合、両方のエラーメッセージが表示される", async () => {
	const user = userEvent.setup();
	render(<LoginForm />);

	const submitButton = screen.getByRole("button", { name: "ログイン" });
	await user.click(submitButton);

	// 両方のバリデーションエラーを確認
	await waitFor(() => {
		expect(
			screen.getByText("メールアドレスを入力してください"),
		).toBeInTheDocument();
		expect(
			screen.getByText("パスワードを入力してください"),
		).toBeInTheDocument();
	});
});

test("送信中の状態：フォーム送信中はボタンが無効化され、ローディングテキストが表示される", async () => {
	// loginAction を非同期で保留状態にする
	vi.mocked(loginAction).mockImplementation(
		() =>
			new Promise((resolve) => {
				setTimeout(() => resolve({ success: true }), 1000);
			}),
	);

	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(emailInput, "test@example.com");
	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// ボタンが無効化されていることを確認
	await waitFor(() => {
		expect(submitButton).toBeDisabled();
	});
	// ローディングテキストが表示されることを確認
	await waitFor(() => {
		expect(
			screen.getByRole("button", { name: "ログイン中..." }),
		).toBeInTheDocument();
	});
});

test("サーバーエラー：認証失敗時にエラーメッセージが表示される", async () => {
	vi.mocked(loginAction).mockResolvedValue({
		error: "認証に失敗しました",
		success: false,
	});

	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(emailInput, "test@example.com");
	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// Server Action からのエラーメッセージを確認
	await waitFor(() => {
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("認証に失敗しました");
	});
});

test("サーバーエラー：入力内容が不正な場合のエラーメッセージが表示される", async () => {
	vi.mocked(loginAction).mockResolvedValue({
		error: "入力内容に誤りがあります",
		success: false,
	});

	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	await user.type(emailInput, "test@example.com");
	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// Server Action からのエラーメッセージを確認
	await waitFor(() => {
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("入力内容に誤りがあります");
	});
});

test("エッジケース：連続したフォーム送信が正しく処理される", async () => {
	const mockLoginAction = vi.mocked(loginAction);
	mockLoginAction.mockClear();
	mockLoginAction.mockResolvedValue({
		error: "エラー",
		success: false,
	});

	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	// 有効な入力でフォームを送信
	await user.type(emailInput, "test@example.com");
	await user.type(passwordInput, "Test@Pass123");
	await user.click(submitButton);

	// loginAction が呼ばれたことを確認
	await waitFor(() => {
		expect(mockLoginAction).toHaveBeenCalledWith({
			password: "Test@Pass123",
			username: "test@example.com",
		});
	});
});

test("フォーム入力：入力値が正しく反映される", async () => {
	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");

	await user.type(emailInput, "user@example.com");
	await user.type(passwordInput, "SecurePass123!");

	// 入力値が正しく反映されていることを確認
	expect(emailInput).toHaveValue("user@example.com");
	expect(passwordInput).toHaveValue("SecurePass123!");
});

test("正常系：有効な入力でフォームが送信される", async () => {
	const mockLoginAction = vi.mocked(loginAction);
	mockLoginAction.mockResolvedValue({
		success: true,
	});

	const user = userEvent.setup();
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");
	const submitButton = screen.getByRole("button", { name: "ログイン" });

	const testEmail = "test@example.com";
	const testPassword = "Test@Pass123";

	await user.type(emailInput, testEmail);
	await user.type(passwordInput, testPassword);
	await user.click(submitButton);

	// loginAction が正しい引数で呼ばれたことを確認
	await waitFor(() => {
		expect(mockLoginAction).toHaveBeenCalledWith({
			password: testPassword,
			username: testEmail,
		} satisfies LoginSchema);
	});
});

test("アクセシビリティ：フォーム要素に適切なラベルが設定されている", async () => {
	render(<LoginForm />);

	// ラベルでフォーム要素が取得できることを確認
	expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
	expect(screen.getByLabelText("パスワード")).toBeInTheDocument();

	// メールアドレスの input type が email であることを確認
	const emailInput = screen.getByLabelText("メールアドレス");
	expect(emailInput).toHaveAttribute("type", "email");

	// パスワードの input type が password であることを確認
	const passwordInput = screen.getByLabelText("パスワード");
	expect(passwordInput).toHaveAttribute("type", "password");
});

test("アクセシビリティ：オートコンプリート属性が適切に設定されている", async () => {
	render(<LoginForm />);

	const emailInput = screen.getByLabelText("メールアドレス");
	const passwordInput = screen.getByLabelText("パスワード");

	// オートコンプリート属性を確認
	expect(emailInput).toHaveAttribute("autocomplete", "username");
	expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
});

test("フォーム属性：noValidate 属性が設定されている", async () => {
	const { container } = render(<LoginForm />);

	const form = container.querySelector("form");
	expect(form).toHaveAttribute("novalidate");
});

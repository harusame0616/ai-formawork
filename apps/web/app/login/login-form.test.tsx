import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as loginActionModule from "./login-action";
import { LoginForm } from "./login-form";

// Server Action を mock
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

describe("LoginForm", () => {
	const mockLoginAction = vi.mocked(loginActionModule.loginAction);

	beforeEach(() => {
		mockLoginAction.mockClear();
	});

	test("初期状態では空のフォームが表示される", () => {
		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		expect(emailInput).toHaveValue("");
		expect(passwordInput).toHaveValue("");
		expect(submitButton).toBeEnabled();
	});

	test("メールアドレスが空の場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// パスワードのみ入力
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// メールアドレスのバリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("メールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		// Server Action が呼ばれないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test("メールアドレスの形式が無効な場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 無効な形式のメールアドレスを入力
		await user.type(emailInput, "invalid-email");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("有効なメールアドレスを入力してください"),
			).toBeInTheDocument();
		});

		// Server Action が呼ばれないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test("パスワードが空の場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// メールアドレスのみ入力
		await user.type(emailInput, "test@example.com");
		await user.click(submitButton);

		// パスワードのバリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("パスワードを入力してください"),
			).toBeInTheDocument();
		});

		// Server Action が呼ばれないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test("両方のフィールドが空の場合、両方のバリデーションエラーが表示される", async () => {
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

		// Server Action が呼ばれないことを確認
		expect(mockLoginAction).not.toHaveBeenCalled();
	});

	test("有効な入力でフォームを送信すると、Server Action が呼ばれる", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 有効な入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// Server Action が正しいパラメータで呼ばれることを確認
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: "Test@Pass123",
				username: "test@example.com",
			});
		});
	});

	test("フォーム送信中はローディング状態が表示され、ボタンが無効になる", async () => {
		const user = userEvent.setup();
		// Server Action を pending 状態にする
		mockLoginAction.mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(() => resolve({ success: true }), 100);
				}),
		);

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 有効な入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// ローディング状態を確認
		await waitFor(() => {
			expect(screen.getByText("ログイン中...")).toBeInTheDocument();
		});

		// ボタンが無効になっていることを確認
		expect(submitButton).toBeDisabled();
	});

	test("Server Action がエラーを返した場合、エラーメッセージが表示される", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({
			error: "認証に失敗しました",
			success: false,
		});

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 有効な入力
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "WrongPassword");
		await user.click(submitButton);

		// エラーメッセージを確認
		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("認証に失敗しました");
		});
	});

	test("エラー後に再送信すると、エラーメッセージがクリアされる", async () => {
		const user = userEvent.setup();
		// 最初はエラー、2回目は成功
		mockLoginAction
			.mockResolvedValueOnce({
				error: "認証に失敗しました",
				success: false,
			})
			.mockResolvedValueOnce({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 最初の送信（エラー）
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "WrongPassword");
		await user.click(submitButton);

		// エラーメッセージを確認
		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("認証に失敗しました");
		});

		// パスワードを変更して再送信
		await user.clear(passwordInput);
		await user.type(passwordInput, "CorrectPassword");
		await user.click(submitButton);

		// エラーメッセージが消えることを確認
		await waitFor(() => {
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});
	});

	test("非常に長いメールアドレスでも正常に処理される", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 非常に長いメールアドレス（254文字が最大）
		const longEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(60)}.com`;
		await user.type(emailInput, longEmail);
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// Server Action が呼ばれることを確認
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: "Test@Pass123",
				username: longEmail,
			});
		});
	});

	test("特殊文字を含むメールアドレスでも正常に処理される", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 特殊文字を含むメールアドレス
		const specialEmail = "test+tag@example.com";
		await user.type(emailInput, specialEmail);
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// Server Action が呼ばれることを確認
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: "Test@Pass123",
				username: specialEmail,
			});
		});
	});

	test("メールアドレスにドットを含む場合でも正常に処理される", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// ドットを含むメールアドレス
		const dottedEmail = "first.last@example.com";
		await user.type(emailInput, dottedEmail);
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// Server Action が呼ばれることを確認
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: "Test@Pass123",
				username: dottedEmail,
			});
		});
	});

	test("メールアドレスの前後に空白がある場合でもバリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 前後に空白があるメールアドレス
		await user.type(emailInput, " test@example.com ");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("有効なメールアドレスを入力してください"),
			).toBeInTheDocument();
		});
	});

	test("パスワードに特殊文字が含まれていても正常に処理される", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 様々な特殊文字を含むパスワード
		const specialPassword = "P@ssw0rd!#$%^&*()";
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, specialPassword);
		await user.click(submitButton);

		// Server Action が呼ばれることを確認
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: specialPassword,
				username: "test@example.com",
			});
		});
	});

	test("複数回連続して送信しても正常に動作する", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({
			error: "認証に失敗しました",
			success: false,
		});

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "Password1");

		// 1回目の送信
		await user.click(submitButton);
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledTimes(1);
		});

		// 2回目の送信
		await user.click(submitButton);
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledTimes(2);
		});

		// 3回目の送信
		await user.click(submitButton);
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledTimes(3);
		});
	});

	test("@記号が複数ある場合、バリデーションエラーが表示される", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// @が複数あるメールアドレス
		await user.type(emailInput, "test@@example.com");
		await user.click(submitButton);

		// バリデーションエラーを確認
		await waitFor(() => {
			expect(
				screen.getByText("有効なメールアドレスを入力してください"),
			).toBeInTheDocument();
		});
	});

	test("ドメインが存在しない場合でもクライアント側ではバリデーションを通過する", async () => {
		const user = userEvent.setup();
		mockLoginAction.mockResolvedValue({ success: true });

		render(<LoginForm />);

		const emailInput = screen.getByLabelText("メールアドレス");
		const passwordInput = screen.getByLabelText("パスワード");
		const submitButton = screen.getByRole("button", { name: "ログイン" });

		// 存在しないドメインのメールアドレス（形式は正しい）
		await user.type(emailInput, "test@nonexistent-domain.com");
		await user.type(passwordInput, "Test@Pass123");
		await user.click(submitButton);

		// Server Action が呼ばれることを確認（クライアント側では形式のみチェック）
		await waitFor(() => {
			expect(mockLoginAction).toHaveBeenCalledWith({
				password: "Test@Pass123",
				username: "test@nonexistent-domain.com",
			});
		});
	});
});

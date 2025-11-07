import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { loginAction } from "./login-action";
import { LoginForm } from "./login-form";

// Server actionをモック
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ヘルパー関数: 要素を取得
	function getEmailInput() {
		return document.querySelector<HTMLInputElement>('input[name="username"]');
	}

	function getPasswordInput() {
		return document.querySelector<HTMLInputElement>('input[name="password"]');
	}

	function getSubmitButton() {
		return screen.getByRole("button", { name: /ログイン/ });
	}

	describe("基本動作", () => {
		it("フォームが正しくレンダリングされること", () => {
			render(<LoginForm />);

			expect(getEmailInput()).toBeInTheDocument();
			expect(getPasswordInput()).toBeInTheDocument();
			expect(getSubmitButton()).toBeInTheDocument();
		});

		it("メールアドレスフィールドが正しい属性を持つこと", () => {
			render(<LoginForm />);

			const emailInput = getEmailInput();
			expect(emailInput).toHaveAttribute("type", "email");
			expect(emailInput).toHaveAttribute("autocomplete", "username");
		});

		it("パスワードフィールドが正しい属性を持つこと", () => {
			render(<LoginForm />);

			const passwordInput = getPasswordInput();
			expect(passwordInput).toHaveAttribute("type", "password");
			expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
		});
	});

	describe("バリデーション", () => {
		it("メールアドレスが空の場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// パスワードのみ入力
			if (passwordInput) {
				await user.type(passwordInput, "Password123!");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});

		it("無効なメールアドレスの場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 無効なメールアドレスを入力
			if (emailInput) {
				await user.type(emailInput, "invalid-email");
			}
			if (passwordInput) {
				await user.type(passwordInput, "Password123!");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("有効なメールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});

		it("パスワードが空の場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const submitButton = getSubmitButton();

			// メールアドレスのみ入力
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("パスワードを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});

		it("両方のフィールドが空の場合、両方のエラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const submitButton = getSubmitButton();

			// フォームを送信
			await user.click(submitButton);

			// 両方のエラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
				expect(
					screen.getByText("パスワードを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});
	});

	describe("エッジケース", () => {
		it("正しい入力でフォーム送信が成功すること", async () => {
			const user = userEvent.setup();
			const mockLoginAction = loginAction as Mock;
			mockLoginAction.mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 正しい入力
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// Server actionが正しい引数で呼ばれることを確認
			await waitFor(() => {
				expect(mockLoginAction).toHaveBeenCalledWith({
					password: "password",
					username: "test@example.com",
				});
			});
		});

		it("Server actionからエラーが返された場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			const mockLoginAction = loginAction as Mock;
			const errorMessage = "ログインに失敗しました";
			mockLoginAction.mockResolvedValue({
				error: errorMessage,
				success: false,
			});

			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 入力
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(screen.getByRole("alert")).toHaveTextContent(errorMessage);
			});
		});

		it("送信中は送信ボタンが無効になること", async () => {
			const user = userEvent.setup();
			const mockLoginAction = loginAction as Mock;
			// 遅延を追加してローディング状態をテスト
			mockLoginAction.mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							resolve({ success: true });
						}, 100);
					}),
			);

			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 入力
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// 送信中はボタンが無効になることを確認
			await waitFor(() => {
				expect(submitButton).toBeDisabled();
			});
		});

		it("送信中はローディング表示されること", async () => {
			const user = userEvent.setup();
			const mockLoginAction = loginAction as Mock;
			// 遅延を追加してローディング状態をテスト
			mockLoginAction.mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							resolve({ success: true });
						}, 100);
					}),
			);

			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 入力
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// ローディングテキストが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: /ログイン中/i }),
				).toBeInTheDocument();
			});
		});

		it("エラーメッセージが表示された後、再度送信するとエラーメッセージがクリアされること", async () => {
			const user = userEvent.setup();
			const mockLoginAction = loginAction as Mock;

			// 最初の送信はエラー
			mockLoginAction.mockResolvedValueOnce({
				error: "ログインに失敗しました",
				success: false,
			});

			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 入力して送信
			if (emailInput) {
				await user.type(emailInput, "test@example.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			// 2回目の送信は成功
			mockLoginAction.mockResolvedValueOnce({ success: true });

			// 再度送信
			await user.click(submitButton);

			// エラーメッセージがクリアされることを確認
			await waitFor(() => {
				expect(screen.queryByRole("alert")).not.toBeInTheDocument();
			});
		});

		it("空白のみのメールアドレスの場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// 空白のみを入力
			if (emailInput) {
				await user.type(emailInput, "   ");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});

		it("メールアドレスに@マークがない場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// @マークがないメールアドレスを入力
			if (emailInput) {
				await user.type(emailInput, "testexample.com");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("有効なメールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});

		it("メールアドレスのドメイン部分がない場合、エラーメッセージが表示されること", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();
			const submitButton = getSubmitButton();

			// ドメイン部分がないメールアドレスを入力
			if (emailInput) {
				await user.type(emailInput, "test@");
			}
			if (passwordInput) {
				await user.type(passwordInput, "password");
			}

			// フォームを送信
			await user.click(submitButton);

			// エラーメッセージが表示されることを確認
			await waitFor(() => {
				expect(
					screen.getByText("有効なメールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// Server actionが呼ばれないことを確認
			expect(loginAction).not.toHaveBeenCalled();
		});
	});
});

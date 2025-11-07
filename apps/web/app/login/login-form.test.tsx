import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { loginAction } from "./login-action";
import { LoginForm } from "./login-form";

// Mock the loginAction server action
vi.mock("./login-action", () => ({
	loginAction: vi.fn(),
}));

describe("LoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("フォーム要素の表示確認", () => {
		test("メールアドレスラベルと入力フィールドが表示されている", () => {
			render(<LoginForm />);

			const label = screen.getByText("メールアドレス");
			const input = screen.getByLabelText("メールアドレス");

			expect(label).toBeInTheDocument();
			expect(input).toBeInTheDocument();
			expect(input).toHaveAttribute("type", "email");
			expect(input).toHaveAttribute("autoComplete", "username");
		});

		test("パスワードラベルと入力フィールドが表示されている", () => {
			render(<LoginForm />);

			const label = screen.getByText("パスワード");
			const input = screen.getByLabelText("パスワード");

			expect(label).toBeInTheDocument();
			expect(input).toBeInTheDocument();
			expect(input).toHaveAttribute("type", "password");
			expect(input).toHaveAttribute("autoComplete", "current-password");
		});

		test("ログインボタンが表示されている", () => {
			render(<LoginForm />);

			const button = screen.getByRole("button", { name: "ログイン" });
			expect(button).toBeInTheDocument();
		});

		test("ヘルプテキストが表示されている", () => {
			render(<LoginForm />);

			const helpText = screen.getByText(
				"アカウントがない場合、パスワードを忘れた場合は管理者にお問い合わせください。",
			);
			expect(helpText).toBeInTheDocument();
		});
	});

	describe("バリデーション - メールアドレス", () => {
		test("空のメールアドレスを送信するとエラーが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// パスワードのみ入力
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// メールアドレスのバリデーションエラーが表示される
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			expect(vi.mocked(loginAction)).not.toHaveBeenCalled();
		});

		test("無効なメールアドレス形式を送信するとエラーが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 無効なメールアドレス形式を入力
			await user.type(emailInput, "invalid-email");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// メールアドレス形式のバリデーションエラーが表示される
			await waitFor(() => {
				expect(
					screen.getByText("有効なメールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			expect(vi.mocked(loginAction)).not.toHaveBeenCalled();
		});
	});

	describe("バリデーション - パスワード", () => {
		test("空のパスワードを送信するとエラーが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// メールアドレスのみ入力
			await user.type(emailInput, "test@example.com");
			await user.click(submitButton);

			// パスワードのバリデーションエラーが表示される
			await waitFor(() => {
				expect(
					screen.getByText("パスワードを入力してください"),
				).toBeInTheDocument();
			});

			expect(vi.mocked(loginAction)).not.toHaveBeenCalled();
		});

		test("両フィールドが空の場合、メールアドレスのエラーが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.click(submitButton);

			// メールアドレスのバリデーションエラーが表示される
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			expect(vi.mocked(loginAction)).not.toHaveBeenCalled();
		});
	});

	describe("フォーム送信 - サーバーアクション", () => {
		test("有効なデータでサーバーアクションが呼ばれる", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalledWith({
					password: "Test@Pass123",
					username: "test@example.com",
				});
			});
		});

		test("複数回の送信が可能である", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 1回目の送信
			await user.type(emailInput, "test1@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalledTimes(1);
			});

			// フィールドをクリア
			await user.clear(emailInput);
			await user.clear(passwordInput);

			// 2回目の送信
			await user.type(emailInput, "test2@example.com");
			await user.type(passwordInput, "Test@Pass456");
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalledTimes(2);
				expect(vi.mocked(loginAction)).toHaveBeenLastCalledWith({
					password: "Test@Pass456",
					username: "test2@example.com",
				});
			});
		});
	});

	describe("エラーメッセージの表示", () => {
		test("サーバーアクションが失敗時、ルートエラーが表示される", async () => {
			const user = userEvent.setup();
			const mockError = "認証に失敗しました";
			vi.mocked(loginAction).mockResolvedValue({
				error: mockError,
				success: false,
			});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			await waitFor(() => {
				const alert = screen.getByRole("alert");
				expect(alert).toHaveTextContent(mockError);
			});
		});

		test("ルートエラーが role alert で表示される", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({
				error: "入力内容に誤りがあります",
				success: false,
			});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});
		});

		test("バリデーションエラーとサーバーエラーが同時に表示される場合、バリデーションエラーのみ表示される", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({
				error: "認証に失敗しました",
				success: false,
			});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// パスワードなしで送信
			await user.type(emailInput, "test@example.com");
			await user.click(submitButton);

			// バリデーションエラーのみ表示される（サーバーアクションは呼ばれない）
			await waitFor(() => {
				expect(
					screen.getByText("パスワードを入力してください"),
				).toBeInTheDocument();
			});

			expect(vi.mocked(loginAction)).not.toHaveBeenCalled();
		});
	});

	describe("エラーのクリア", () => {
		test("バリデーションエラーが次の送信で自動クリアされる", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 1回目：バリデーションエラーが出る
			await user.type(emailInput, "invalid-email");
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText("有効なメールアドレスを入力してください"),
				).toBeInTheDocument();
			});

			// フィールドをクリア
			await user.clear(emailInput);

			// 正しいメールアドレスを入力
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// エラーが消えている
			await waitFor(() => {
				expect(
					screen.queryByText("有効なメールアドレスを入力してください"),
				).not.toBeInTheDocument();
				expect(vi.mocked(loginAction)).toHaveBeenCalled();
			});
		});

		test("ルートエラーが次の送信で自動クリアされる", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction)
				.mockResolvedValueOnce({
					error: "認証に失敗しました",
					success: false,
				})
				.mockResolvedValueOnce({
					success: true,
				});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 1回目：ログイン失敗
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "WrongPassword");
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			// フィールドをクリア
			await user.clear(emailInput);
			await user.clear(passwordInput);

			// 2回目：ログイン成功
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// エラーが消えている
			await waitFor(() => {
				expect(screen.queryByRole("alert")).not.toBeInTheDocument();
			});
		});
	});

	describe("ローディング状態", () => {
		test("送信中はボタンが disabled になる", async () => {
			const user = userEvent.setup();
			// loginAction が解決しないようにする
			vi.mocked(loginAction).mockImplementation(
				() =>
					new Promise(() => {
						/* never resolves */
					}),
			);

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// ボタンが disabled になっている
			await waitFor(() => {
				expect(submitButton).toBeDisabled();
			});
		});

		test("送信中はボタンテキストが変わる", async () => {
			const user = userEvent.setup();
			// loginAction が解決しないようにする
			vi.mocked(loginAction).mockImplementation(
				() =>
					new Promise(() => {
						/* never resolves */
					}),
			);

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// ボタンテキストが「ログイン中...」に変わっている
			await waitFor(() => {
				expect(screen.getByText("ログイン中...")).toBeInTheDocument();
			});
		});

		test("送信中はスピナーが表示される", async () => {
			const user = userEvent.setup();
			// loginAction が解決しないようにする
			vi.mocked(loginAction).mockImplementation(
				() =>
					new Promise(() => {
						/* never resolves */
					}),
			);

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// スピナーが表示される
			await waitFor(() => {
				expect(screen.getByText("ログイン中...")).toBeInTheDocument();
			});
		});

		test("エラーメッセージが表示される場合、ボタンはクリック可能な状態を維持", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({
				error: "認証に失敗しました",
				success: false,
			});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// エラーメッセージが表示される
			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});

			// サーバーアクションが呼ばれたことを確認
			expect(vi.mocked(loginAction)).toHaveBeenCalled();
		});
	});

	describe("ユーザーインタラクション", () => {
		test("入力フィールドに文字を入力できる", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = screen.getByLabelText(
				"メールアドレス",
			) as HTMLInputElement;
			const passwordInput = screen.getByLabelText(
				"パスワード",
			) as HTMLInputElement;

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");

			expect(emailInput.value).toBe("test@example.com");
			expect(passwordInput.value).toBe("Test@Pass123");
		});

		test("入力フィールドをクリアできる", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = screen.getByLabelText(
				"メールアドレス",
			) as HTMLInputElement;

			await user.type(emailInput, "test@example.com");
			expect(emailInput.value).toBe("test@example.com");

			await user.clear(emailInput);
			expect(emailInput.value).toBe("");
		});

		test("Enter キーでフォーム送信できる", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.keyboard("{Enter}");

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalled();
			});
		});

		test("ボタンをクリックで連続送信できる", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");

			// 1回目の送信
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe("エッジケース", () => {
		test("複数回のフォーム送信が可能である", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction)
				.mockResolvedValueOnce({ success: true })
				.mockResolvedValueOnce({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 1回目の送信
			await user.type(emailInput, "test1@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenLastCalledWith({
					password: "Test@Pass123",
					username: "test1@example.com",
				});
			});
		});

		test("特殊文字を含むメールアドレスの場合、有効なメールアドレス形式チェックに従う", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({ success: true });

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 特殊文字を含むが有効なメールアドレス
			await user.type(emailInput, "test+tag@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// サーバーアクションが呼ばれる
			await waitFor(() => {
				expect(vi.mocked(loginAction)).toHaveBeenCalledWith({
					password: "Test@Pass123",
					username: "test+tag@example.com",
				});
			});
		});

		test("複数のバリデーションエラーがある場合、すべてのエラーが表示される", async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			// 両フィールドが空のまま送信
			await user.click(submitButton);

			// 複数のエラーが表示される
			await waitFor(() => {
				expect(
					screen.getByText("メールアドレスを入力してください"),
				).toBeInTheDocument();
				expect(
					screen.getByText("パスワードを入力してください"),
				).toBeInTheDocument();
			});
		});
	});

	describe("アクセシビリティ", () => {
		test("ラベルが入力フィールドと正しく関連付けられている", () => {
			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");

			expect(emailInput).toHaveAccessibleName("メールアドレス");
			expect(passwordInput).toHaveAccessibleName("パスワード");
		});

		test("エラーメッセージが role alert として表示される", async () => {
			const user = userEvent.setup();
			vi.mocked(loginAction).mockResolvedValue({
				error: "認証に失敗しました",
				success: false,
			});

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// エラーが role alert として表示される
			await waitFor(() => {
				expect(screen.getByRole("alert")).toBeInTheDocument();
			});
		});

		test("ボタンが正しくラベルされている", () => {
			render(<LoginForm />);

			const button = screen.getByRole("button", { name: "ログイン" });
			expect(button).toHaveAccessibleName("ログイン");
		});

		test("フォーム送信中、テキストが表示される", async () => {
			const user = userEvent.setup();
			// loginAction が解決しないようにする
			vi.mocked(loginAction).mockImplementation(
				() =>
					new Promise(() => {
						/* never resolves */
					}),
			);

			render(<LoginForm />);

			const emailInput = screen.getByLabelText("メールアドレス");
			const passwordInput = screen.getByLabelText("パスワード");
			const submitButton = screen.getByRole("button", {
				name: "ログイン",
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "Test@Pass123");
			await user.click(submitButton);

			// ローディングテキストが表示される
			await waitFor(() => {
				expect(screen.getByText("ログイン中...")).toBeInTheDocument();
			});
		});
	});
});

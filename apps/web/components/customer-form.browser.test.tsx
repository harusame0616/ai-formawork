import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerForm } from "./customer-form";

const test = base.extend<{
	onSubmitMock: Mock;
}>({
	onSubmitMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const mock = vi.fn();
		await use(mock);
		vi.clearAllMocks();
	},
});

test("顧客名が空の場合、バリデーションエラーが表示される", async ({
	onSubmitMock,
}) => {
	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// メールアドレスだけを入力
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("顧客名を入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスが空の場合、バリデーションエラーが表示される", async ({
	onSubmitMock,
}) => {
	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 顧客名だけを入力
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("メールアドレスを入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスの形式が不正な場合、バリデーションエラーが表示される", async ({
	onSubmitMock,
}) => {
	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 不正な形式のメールアドレスを入力
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("invalid-email");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("有効なメールアドレスを入力してください"))
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	onSubmitMock,
}) => {
	onSubmitMock.mockReturnValue(new Promise(() => {}));

	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 有効な入力
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 送信中の状態を確認
	const button = page.getByRole("button", { name: /処理中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("処理中...")).toBeInTheDocument();
});

test("エラー時にエラーメッセージが表示される", async ({ onSubmitMock }) => {
	// onSubmit がエラーを返すようにモック
	onSubmitMock.mockResolvedValue({
		error: "このメールアドレスは既に登録されています",
		success: false,
	});

	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 有効な入力
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// エラーメッセージが表示されることを確認
	await expect.element(page.getByRole("alert")).toBeInTheDocument();
	await expect
		.element(page.getByText("このメールアドレスは既に登録されています"))
		.toBeInTheDocument();
});

test("顧客名が100文字を超える場合、バリデーションエラーが表示される", async ({
	onSubmitMock,
}) => {
	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 101文字の顧客名を入力
	const longName = "あ".repeat(101);
	await page.getByRole("textbox", { name: "顧客名" }).fill(longName);
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("顧客名は100文字以内で入力してください"))
		.toBeInTheDocument();

	expect(onSubmitMock).not.toHaveBeenCalled();
});

test("メールアドレスが254文字を超える場合、バリデーションエラーが表示される", async ({
	onSubmitMock,
}) => {
	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 255文字のメールアドレスを入力 (243 + 1(@) + 11(example.com) = 255文字)
	const longEmail = `${"a".repeat(243)}@example.com`;
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");
	await page.getByRole("textbox", { name: "メールアドレス" }).fill(longEmail);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.toBeInTheDocument();

	expect(onSubmitMock).not.toHaveBeenCalled();
});

test("顧客名が100文字（境界値）の場合、送信できる", async ({
	onSubmitMock,
}) => {
	// エラーをモック
	onSubmitMock.mockResolvedValue({
		error: "予期しないエラーが発生しました",
		success: false,
	});

	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 100文字の顧客名を入力
	const boundaryName = "あ".repeat(100);
	await page.getByRole("textbox", { name: "顧客名" }).fill(boundaryName);
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill("test@example.com");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 文字数制限のバリデーションエラーが表示されないことを確認
	await expect
		.element(page.getByText("顧客名は100文字以内で入力してください"))
		.not.toBeInTheDocument();

	// onSubmitが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(onSubmitMock).toHaveBeenCalled();
});

test("メールアドレスが254文字（境界値）の場合、送信できる", async ({
	onSubmitMock,
}) => {
	// エラーをモック
	onSubmitMock.mockResolvedValue({
		error: "予期しないエラーが発生しました",
		success: false,
	});

	render(<CustomerForm onSubmit={onSubmitMock} submitLabel="登録する" />);

	// 254文字のメールアドレスを入力 (242 + 1(@) + 11(example.com) = 254文字)
	const boundaryEmail = `${"a".repeat(242)}@example.com`;
	await page.getByRole("textbox", { name: "顧客名" }).fill("テスト太郎");
	await page
		.getByRole("textbox", { name: "メールアドレス" })
		.fill(boundaryEmail);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 文字数制限のバリデーションエラーが表示されないことを確認
	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.not.toBeInTheDocument();

	// onSubmitが呼ばれたことを確認（バリデーションを通過した証拠）
	expect(onSubmitMock).toHaveBeenCalled();
});

test("初期値が設定されている場合、フォームに反映される", async ({
	onSubmitMock,
}) => {
	render(
		<CustomerForm
			defaultValues={{
				email: "initial@example.com",
				name: "初期太郎",
			}}
			onSubmit={onSubmitMock}
			submitLabel="更新する"
		/>,
	);

	const nameInput = page.getByRole("textbox", { name: "顧客名" });
	const emailInput = page.getByRole("textbox", { name: "メールアドレス" });

	await expect.element(nameInput).toHaveValue("初期太郎");
	await expect.element(emailInput).toHaveValue("initial@example.com");
});

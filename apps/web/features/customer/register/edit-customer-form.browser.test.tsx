import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { EditCustomerForm } from "./edit-customer-form";

// registerCustomerAction をモック
vi.mock("./register-customer-action", () => ({
	registerCustomerAction: vi.fn(),
}));

vi.mock("../detail/edit/edit-customer-action", () => ({
	editCustomerAction: vi.fn(),
}));

const test = base.extend<{
	registerCustomerActionMock: Mock;
}>({
	registerCustomerActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const registerCustomerActionModule = await import(
			"./register-customer-action"
		);
		await use(registerCustomerActionModule.registerCustomerAction);
		vi.clearAllMocks();
	},
});

test("名前が空の場合、エラーが表示される", async () => {
	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 送信ボタンをクリック（名前を入力せず）
	await page.getByRole("button", { name: "登録する" }).click();

	await expect
		.element(page.getByText("名前を入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスの形式が不正な場合、エラーが表示される", async () => {
	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 不正な形式のメールアドレスを入力
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill("invalid-email");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("正しいメールアドレス形式で入力してください"))
		.toBeInTheDocument();
});

test("送信中はボタンが無効化され、ローディング表示になる", async ({
	registerCustomerActionMock,
}) => {
	registerCustomerActionMock.mockReturnValue(new Promise(() => {}));

	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 有効な入力
	await page.getByLabelText("名前").fill("テスト太郎");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// 送信中の状態を確認
	const button = page.getByRole("button", { name: /登録中/ });

	await expect.element(button).toBeDisabled();
	await expect.element(page.getByText("登録中...")).toBeInTheDocument();
});

test("登録エラー時にエラーメッセージが表示される", async ({
	registerCustomerActionMock,
}) => {
	// registerCustomerAction がエラーを返すようにモック
	registerCustomerActionMock.mockResolvedValue({
		error: "サーバーエラーが発生しました。時間をおいて再度お試しください",
		success: false,
	});

	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 有効な入力
	await page.getByLabelText("名前").fill("テスト太郎");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// エラーメッセージが表示されることを確認
	await expect.element(page.getByRole("alert")).toBeInTheDocument();
	await expect
		.element(
			page.getByText(
				"サーバーエラーが発生しました。時間をおいて再度お試しください",
			),
		)
		.toBeInTheDocument();
});

test("名前が25文字（最大値24文字を超える）場合、エラーが表示される", async () => {
	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 25文字の名前を入力
	await page
		.getByLabelText("名前")
		.fill("あいうえおかきくけこさしすせそたちつてとなにぬねのは");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("名前は24文字以内で入力してください"))
		.toBeInTheDocument();
});

test("メールアドレスが255文字（最大値254文字を超える）場合、エラーが表示される", async () => {
	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 255文字のメールアドレスを入力（ローカル部分64文字 + @ + ドメイン部分190文字 = 255文字）

	const longEmail = `${"a".repeat(64)}@${"example-".repeat(22)}example123.com`;
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("メールアドレス").fill(longEmail);

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("メールアドレスは254文字以内で入力してください"))
		.toBeInTheDocument();
});

test("電話番号が21文字（最大値20文字を超える）場合、エラーが表示される", async () => {
	render(<EditCustomerForm />);

	// ハイドレーション完了を待つ
	await expect.element(page.getByLabelText("名前")).not.toBeDisabled();

	// 21文字の電話番号を入力（ハイフン込みで入力し、ハイフン除去後に21文字になる）
	await page.getByLabelText("名前").fill("テスト太郎");
	await page.getByLabelText("電話番号").fill("012-3456-7890-1234567890");

	// 送信ボタンをクリック
	await page.getByRole("button", { name: "登録する" }).click();

	// バリデーションエラーが表示されることを確認
	await expect
		.element(page.getByText("電話番号は20文字以内で入力してください"))
		.toBeInTheDocument();
});

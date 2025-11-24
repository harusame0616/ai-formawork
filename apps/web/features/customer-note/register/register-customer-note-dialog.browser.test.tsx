import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { RegisterCustomerNoteDialog } from "./register-customer-note-dialog";

// Server Actionをモック
vi.mock("./register-customer-note-action", () => ({
	registerCustomerNoteAction: vi.fn(),
}));

const test = base.extend<{
	registerCustomerNoteActionMock: Mock;
}>({
	registerCustomerNoteActionMock: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
		use: any,
	) => {
		const registerCustomerNoteActionModule = await import(
			"./register-customer-note-action"
		);
		const mock = vi.mocked(
			registerCustomerNoteActionModule.registerCustomerNoteAction,
		);
		await use(mock);
		vi.clearAllMocks();
	},
});

test("内容が空の場合、バリデーションエラーが表示される", async ({
	registerCustomerNoteActionMock,
}) => {
	const testCustomerId = "00000000-0000-0000-0000-000000000001";

	render(<RegisterCustomerNoteDialog customerId={testCustomerId} />);

	// ダイアログを開く
	await page.getByRole("button", { name: "ノートを追加" }).click();

	// 内容を入力せずに登録ボタンをクリック
	await page.getByRole("button", { name: "登録" }).click();

	// バリデーションエラーが表示される
	await expect
		.element(page.getByText("内容を入力してください"))
		.toBeInTheDocument();

	// Server Actionが呼ばれないことを確認
	expect(registerCustomerNoteActionMock).not.toHaveBeenCalled();
});

test("キャンセルボタンでダイアログが閉じる", async () => {
	const testCustomerId = "00000000-0000-0000-0000-000000000001";

	render(<RegisterCustomerNoteDialog customerId={testCustomerId} />);

	// ダイアログを開く
	await page.getByRole("button", { name: "ノートを追加" }).click();

	// 内容を入力
	await page.getByLabelText("内容").fill("テストノート");

	// キャンセルボタンをクリック
	await page.getByRole("button", { name: "キャンセル" }).click();

	// ダイアログが閉じることを確認
	await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});

test("キャンセル後に再度開くとフォームがリセットされている", async () => {
	const testCustomerId = "00000000-0000-0000-0000-000000000001";
	const testContent = "テストノート";

	render(<RegisterCustomerNoteDialog customerId={testCustomerId} />);

	// ダイアログを開く
	await page.getByRole("button", { name: "ノートを追加" }).click();

	// 内容を入力
	await page.getByLabelText("内容").fill(testContent);

	// キャンセル
	await page.getByRole("button", { name: "キャンセル" }).click();

	// 再度ダイアログを開く
	await page.getByRole("button", { name: "ノートを追加" }).click();

	// 入力フィールドが空であることを確認
	await expect.element(page.getByLabelText("内容")).toHaveValue("");
});

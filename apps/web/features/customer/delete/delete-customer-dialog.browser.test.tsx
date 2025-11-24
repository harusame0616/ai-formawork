import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DeleteCustomerDialog } from "./delete-customer-dialog";

// Server Actionをモック
vi.mock("./delete-customer-action", () => ({
	deleteCustomerAction: vi.fn(),
}));

test("削除ボタンをクリックするとダイアログが表示される", async () => {
	render(<DeleteCustomerDialog customerId="test-id" />);

	// 削除ボタンをクリック
	await page.getByRole("button", { name: "削除" }).click();

	// ダイアログが表示される
	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect
		.element(dialog.getByRole("heading", { name: "顧客を削除" }))
		.toBeInTheDocument();
	await expect
		.element(
			dialog.getByText(
				"この顧客を削除してもよろしいですか？関連するすべてのノートと画像も削除されます。この操作は取り消せません。",
			),
		)
		.toBeInTheDocument();
});

test("キャンセルボタンをクリックするとダイアログが閉じる", async () => {
	render(<DeleteCustomerDialog customerId="test-id" />);

	// 削除ボタンをクリックしてダイアログを開く
	await page.getByRole("button", { name: "削除" }).click();

	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	// キャンセルボタンをクリック
	await dialog.getByRole("button", { name: "キャンセル" }).click();

	// ダイアログが閉じる
	await expect.element(dialog).not.toBeInTheDocument();
});

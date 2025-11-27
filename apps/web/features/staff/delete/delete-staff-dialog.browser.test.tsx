import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DeleteStaffDialog } from "./delete-staff-dialog";

vi.mock("./delete-staff-action", () => ({
	deleteStaffAction: vi.fn(),
}));

test("削除ボタンをクリックするとダイアログが表示される", async () => {
	render(<DeleteStaffDialog staffId="test-id" />);

	await page.getByRole("button", { name: "削除" }).click();

	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect
		.element(dialog.getByRole("heading", { name: "スタッフを削除" }))
		.toBeInTheDocument();
	await expect
		.element(
			dialog.getByText(
				"このスタッフを削除してもよろしいですか？この操作は取り消せません。",
			),
		)
		.toBeInTheDocument();
});

test("キャンセルボタンをクリックするとダイアログが閉じる", async () => {
	render(<DeleteStaffDialog staffId="test-id" />);

	await page.getByRole("button", { name: "削除" }).click();

	const dialog = page.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	await dialog.getByRole("button", { name: "キャンセル" }).click();

	await expect.element(dialog).not.toBeInTheDocument();
});

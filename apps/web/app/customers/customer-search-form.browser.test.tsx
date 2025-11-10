import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerSearchForm } from "./customer-search-form";

// Next.js routerをモック
const pushMock = vi.hoisted(() => vi.fn());
const getMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
	useSearchParams: () => ({
		get: getMock,
	}),
}));

test("検索フォームが表示される", async () => {
	render(<CustomerSearchForm />);

	await expect
		.element(page.getByText("名前、メールアドレス、電話番号で検索できます"))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "検索" }))
		.toBeInTheDocument();
});

test("キーワードを入力できる", async () => {
	render(<CustomerSearchForm />);

	const input = page.getByLabelText("検索キーワード");
	await input.fill("テスト太郎");

	await expect.element(input).toHaveValue("テスト太郎");
});

test("検索ボタンをクリックするとフォームが送信される", async () => {
	render(<CustomerSearchForm />);

	const input = page.getByLabelText("検索キーワード");
	await input.fill("テスト");

	await page.getByRole("button", { name: "検索" }).click();

	expect(pushMock).toHaveBeenCalledWith(
		"/customers?keyword=%E3%83%86%E3%82%B9%E3%83%88",
	);
});

test("キーワードが空の場合、パラメータなしで遷移する", async () => {
	render(<CustomerSearchForm />);

	await page.getByRole("button", { name: "検索" }).click();

	expect(pushMock).toHaveBeenCalledWith("/customers?");
});

test("既存のキーワードが初期値として設定される", async () => {
	getMock.mockReturnValue("initial keyword");

	render(<CustomerSearchForm />);

	const input = page.getByLabelText("検索キーワード");
	await expect.element(input).toHaveValue("initial keyword");
});

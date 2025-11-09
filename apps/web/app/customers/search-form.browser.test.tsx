import { test, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { SearchForm } from "./search-form";

// useRouter と useSearchParams をモック
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn(),
	})),
	useSearchParams: vi.fn(() => new URLSearchParams()),
}));

test("初期状態でデフォルトのキーワードが入力欄に表示される", async () => {
	render(<SearchForm defaultKeyword="テスト" />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await expect.element(input).toHaveValue("テスト");
});

test("空のキーワードで初期化される", async () => {
	render(<SearchForm defaultKeyword="" />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await expect.element(input).toHaveValue("");
});

test("検索ボタンが表示される", async () => {
	render(<SearchForm defaultKeyword="" />);

	const button = page.getByRole("button", { name: /検索/ });
	await expect.element(button).toBeInTheDocument();
});

test("入力欄にテキストを入力できる", async () => {
	render(<SearchForm defaultKeyword="" />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await input.fill("山田太郎");

	await expect.element(input).toHaveValue("山田太郎");
});

test("フォーム送信時にrouterのpushが呼ばれる", async () => {
	const pushMock = vi.fn();
	const { useRouter } = await import("next/navigation");
	vi.mocked(useRouter).mockReturnValue({
		push: pushMock,
		replace: vi.fn(),
		refresh: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
	});

	render(<SearchForm defaultKeyword="" />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await input.fill("テスト検索");

	const button = page.getByRole("button", { name: /検索/ });
	await button.click();

	// 非同期処理が完了するまで待機
	await vi.waitFor(() => {
		expect(pushMock).toHaveBeenCalled();
	});
});

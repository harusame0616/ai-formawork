import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerSearchForm } from "./customer-search-form";

// Next.js routerをモック
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(() => null),
	}),
}));

test("検索フォームが表示される", async () => {
	render(<CustomerSearchForm />);

	await expect
		.element(
			page.getByPlaceholder("名前、メールアドレス、電話番号で検索"),
		)
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "検索" }))
		.toBeInTheDocument();
});

test("キーワードを入力できる", async () => {
	render(<CustomerSearchForm />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await input.fill("テスト太郎");

	await expect.element(input).toHaveValue("テスト太郎");
});

test("検索ボタンをクリックするとフォームが送信される", async () => {
	const { useRouter } = await import("next/navigation");
	const mockPush = vi.fn();
	vi.mocked(useRouter).mockReturnValue({
		push: mockPush,
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
		refresh: vi.fn(),
		replace: vi.fn(),
	});

	render(<CustomerSearchForm />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await input.fill("テスト");

	await page.getByRole("button", { name: "検索" }).click();

	expect(mockPush).toHaveBeenCalledWith("/customers?keyword=%E3%83%86%E3%82%B9%E3%83%88");
});

test("キーワードが空の場合、パラメータなしで遷移する", async () => {
	const { useRouter } = await import("next/navigation");
	const mockPush = vi.fn();
	vi.mocked(useRouter).mockReturnValue({
		push: mockPush,
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
		refresh: vi.fn(),
		replace: vi.fn(),
	});

	render(<CustomerSearchForm />);

	await page.getByRole("button", { name: "検索" }).click();

	expect(mockPush).toHaveBeenCalledWith("/customers?");
});

test("既存のキーワードが初期値として設定される", async () => {
	const { useSearchParams } = await import("next/navigation");
	vi.mocked(useSearchParams).mockReturnValue({
		get: vi.fn((key: string) => (key === "keyword" ? "既存キーワード" : null)),
		// biome-ignore lint/suspicious/noExplicitAny: Mock implementation
	} as any);

	render(<CustomerSearchForm />);

	const input = page.getByPlaceholder(
		"名前、メールアドレス、電話番号で検索",
	);
	await expect.element(input).toHaveValue("既存キーワード");
});

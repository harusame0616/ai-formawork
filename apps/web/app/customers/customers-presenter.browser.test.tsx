import type { SelectCustomer } from "@workspace/db/schema/customer";
import { SearchPagination } from "@workspace/ui/components/search-pagination";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { CustomersPresenter } from "./customers-presenter";

// Next.js routerをモック

vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("path"),
	useRouter: () => ({
		push: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

const mockCustomers: SelectCustomer[] = [
	{
		createdAt: new Date("2024-01-01"),
		customerId: "1",
		email: "test1@example.com",
		name: "テスト太郎",
		phone: "090-1234-5678",
		updatedAt: new Date("2024-01-01"),
	},
	{
		createdAt: new Date("2024-01-02"),
		customerId: "2",
		email: "test2@example.com",
		name: "山田花子",
		phone: null,
		updatedAt: new Date("2024-01-02"),
	},
];

test("電話番号がnullの場合は'-'が表示される", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} page={1} totalPages={1} />,
	);

	// 電話番号がnullの場合は"-"が表示される
	await expect
		.element(page.getByRole("cell", { exact: true, name: "-" }))
		.toBeInTheDocument();
});

test("ページネーションのリンクに正しいURLが設定される", async () => {
	render(<SearchPagination currentPage={1} totalPages={5} />);

	const page2Link = page.getByRole("link", { name: "2" });
	await expect.element(page2Link).toHaveAttribute("href", "path?page=2");
});

test("totalPagesが1以下の場合、すべてのボタンが無効化される", async () => {
	render(<SearchPagination currentPage={1} totalPages={1} />);

	// すべてのボタンが無効化される
	const prevButton = page.getByRole("link", { name: "前へ" });
	await expect.element(prevButton).toHaveAttribute("aria-disabled", "true");

	const nextButton = page.getByRole("link", { name: "次へ" });
	await expect.element(nextButton).toHaveAttribute("aria-disabled", "true");

	const page1Link = page.getByRole("link", { name: "1" });
	await expect.element(page1Link).toHaveAttribute("aria-disabled", "true");
});

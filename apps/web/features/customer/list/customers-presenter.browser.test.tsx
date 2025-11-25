import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomersPresenter } from "./customers-presenter";
import type { CustomersListItem } from "./schema";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("path"),
	useRouter: vi.fn().mockReturnValue({
		push: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

const mockCustomers: CustomersListItem[] = [
	{
		customerId: "1",
		email: "customer1@example.com",
		name: "顧客1",
		phone: "090-1234-5678",
	},
	{
		customerId: "2",
		email: "customer2@example.com",
		name: "顧客2",
		phone: "090-8765-4321",
	},
];

test("顧客一覧が表示される", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} page={1} totalPages={1} />,
	);

	await expect.element(page.getByText("顧客1")).toBeInTheDocument();
	await expect.element(page.getByText("顧客2")).toBeInTheDocument();
	await expect
		.element(page.getByText("customer1@example.com"))
		.toBeInTheDocument();
	await expect
		.element(page.getByText("customer2@example.com"))
		.toBeInTheDocument();
});

test("顧客が0件の場合、空のメッセージが表示される", async () => {
	render(<CustomersPresenter customers={[]} page={1} totalPages={0} />);

	await expect
		.element(page.getByText("顧客が見つかりませんでした"))
		.toBeInTheDocument();
});

test("ページネーションが表示される", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} page={2} totalPages={3} />,
	);

	// SearchPaginationコンポーネント自体のテストではないため、存在確認のみ
	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();
});

test("ページネーションが1ページのみの場合全てのボタンがdisabled", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} page={1} totalPages={1} />,
	);

	// 1ページのみの場合、全てのボタンがdisabledになる
	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();

	// 前へボタンがdisabled
	const previousButton = page.getByRole("link", { name: "前へ" });
	await expect.element(previousButton).toHaveAttribute("aria-disabled", "true");

	// ページ番号ボタンがdisabled（aria-current="page"で現在ページを特定）
	const pageButton = page.getByRole("link", {
		name: /^1$/,
	});
	await expect.element(pageButton).toHaveAttribute("aria-disabled", "true");

	// 次へボタンがdisabled
	const nextButton = page.getByRole("link", { name: "次へ" });
	await expect.element(nextButton).toHaveAttribute("aria-disabled", "true");
});

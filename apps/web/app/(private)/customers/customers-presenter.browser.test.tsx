import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

// Next.js Link をモック（インポート前にモックを定義）
vi.mock("next/link", () => {
	return {
		default: ({ children, href }: { children: React.ReactNode; href: string }) => {
			return <a href={href}>{children}</a>;
		},
	};
});

vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("path"),
	useRouter: vi.fn().mockReturnValue({
		push: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

import type { SelectCustomer } from "@workspace/db/schema/customer";
import { SearchPagination } from "@workspace/ui/components/search-pagination";
import { CustomersPresenter } from "./customers-presenter";

const mockCustomers: SelectCustomer[] = [
	{
		createdAt: new Date("2024-01-01"),
		customerId: "1",
		email: "customer1@example.com",
		name: "顧客1",
		phone: "090-1234-5678",
		updatedAt: new Date("2024-01-01"),
	},
	{
		createdAt: new Date("2024-01-02"),
		customerId: "2",
		email: "customer2@example.com",
		name: "顧客2",
		phone: "090-8765-4321",
		updatedAt: new Date("2024-01-02"),
	},
];

test("顧客一覧が表示される", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} totalPages={1} page={1} />,
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
	render(<CustomersPresenter customers={[]} totalPages={0} page={1} />);

	await expect.element(page.getByText("顧客がいません")).toBeInTheDocument();
});

test("ページネーションが表示される", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} totalPages={3} page={2} />,
	);

	// SearchPaginationコンポーネント自体のテストではないため、存在確認のみ
	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();
});

test("ページネーションが1ページのみの場合表示されない", async () => {
	render(
		<CustomersPresenter customers={mockCustomers} totalPages={1} page={1} />,
	);

	// 1ページのみの場合、SearchPaginationは表示されない
	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).not.toBeInTheDocument();
});

import type { SelectCustomer } from "@workspace/db/schema/customer";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomersPresenter } from "./customers-presenter";

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

test("顧客一覧が表示される", async () => {
	render(
		<CustomersPresenter
			customers={mockCustomers}
			page={1}
			pageSize={20}
			total={2}
			totalPages={1}
		/>,
	);

	await expect
		.element(page.getByRole("cell", { name: "テスト太郎" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("cell", { name: "test1@example.com" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("cell", { name: "090-1234-5678" }))
		.toBeInTheDocument();

	await expect
		.element(page.getByRole("cell", { name: "山田花子" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("cell", { name: "test2@example.com" }))
		.toBeInTheDocument();
	// 電話番号がnullの場合は"-"が表示される
	await expect.element(page.getByText("-")).toBeInTheDocument();
});

test("顧客が0件の場合、メッセージが表示される", async () => {
	render(
		<CustomersPresenter
			customers={[]}
			page={1}
			pageSize={20}
			total={0}
			totalPages={0}
		/>,
	);

	await expect
		.element(page.getByText("顧客が見つかりませんでした"))
		.toBeInTheDocument();
});

test("ページネーションが表示される", async () => {
	const manyCustomers = Array.from({ length: 20 }, (_, i) => ({
		createdAt: new Date(),
		customerId: String(i + 1),
		email: `test${i + 1}@example.com`,
		name: `テストユーザー${i + 1}`,
		phone: null,
		updatedAt: new Date(),
	}));

	render(
		<CustomersPresenter
			customers={manyCustomers}
			page={1}
			pageSize={20}
			total={100}
			totalPages={5}
		/>,
	);

	// ページネーションリンクが存在することを確認
	await expect
		.element(page.getByRole("link", { name: "1" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("link", { name: "2" }))
		.toBeInTheDocument();
});

test("現在のページがアクティブ状態で表示される", async () => {
	const manyCustomers = Array.from({ length: 20 }, (_, i) => ({
		createdAt: new Date(),
		customerId: String(i + 1),
		email: `test${i + 1}@example.com`,
		name: `テストユーザー${i + 1}`,
		phone: null,
		updatedAt: new Date(),
	}));

	render(
		<CustomersPresenter
			customers={manyCustomers}
			keyword="test"
			page={2}
			pageSize={20}
			total={100}
			totalPages={5}
		/>,
	);

	const page2Link = page.getByRole("link", { name: "2" });
	await expect.element(page2Link).toHaveAttribute("aria-current", "page");
});

test("ページネーションのリンクに正しいURLが設定される", async () => {
	const manyCustomers = Array.from({ length: 20 }, (_, i) => ({
		createdAt: new Date(),
		customerId: String(i + 1),
		email: `test${i + 1}@example.com`,
		name: `テストユーザー${i + 1}`,
		phone: null,
		updatedAt: new Date(),
	}));

	render(
		<CustomersPresenter
			customers={manyCustomers}
			keyword="テスト"
			page={1}
			pageSize={20}
			total={100}
			totalPages={5}
		/>,
	);

	const page2Link = page.getByRole("link", { name: "2" });
	await expect
		.element(page2Link)
		.toHaveAttribute(
			"href",
			"/customers?keyword=%E3%83%86%E3%82%B9%E3%83%88&page=2",
		);
});

test("最初のページでは「前へ」ボタンが無効化される", async () => {
	const manyCustomers = Array.from({ length: 20 }, (_, i) => ({
		createdAt: new Date(),
		customerId: String(i + 1),
		email: `test${i + 1}@example.com`,
		name: `テストユーザー${i + 1}`,
		phone: null,
		updatedAt: new Date(),
	}));

	render(
		<CustomersPresenter
			customers={manyCustomers}
			page={1}
			pageSize={20}
			total={100}
			totalPages={5}
		/>,
	);

	// 「前へ」はリンクではなくspanとして表示される
	const prevButton = page.getByText("前へ");
	const element = await prevButton.element();
	expect(element.tagName).toBe("SPAN");
});

test("最後のページでは「次へ」ボタンが無効化される", async () => {
	const manyCustomers = Array.from({ length: 20 }, (_, i) => ({
		createdAt: new Date(),
		customerId: String(i + 1),
		email: `test${i + 1}@example.com`,
		name: `テストユーザー${i + 1}`,
		phone: null,
		updatedAt: new Date(),
	}));

	render(
		<CustomersPresenter
			customers={manyCustomers}
			page={5}
			pageSize={20}
			total={100}
			totalPages={5}
		/>,
	);

	// 「次へ」はリンクではなくspanとして表示される
	const nextButton = page.getByText("次へ");
	const element = await nextButton.element();
	expect(element.tagName).toBe("SPAN");
});

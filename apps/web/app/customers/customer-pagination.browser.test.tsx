import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerPagination } from "./customer-pagination";

const useRouterMock = vi.hoisted(() => ({
	push: vi.fn(),
}));

const useSearchParamsMock = vi.hoisted(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
	useRouter: () => useRouterMock,
	useSearchParams: () => useSearchParamsMock,
}));

test("ページネーションが表示される", async () => {
	render(<CustomerPagination currentPage={1} totalPages={5} />);

	await expect
		.element(page.getByRole("button", { name: "Previous" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "Next" }))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "1" }))
		.toBeInTheDocument();
});

test("現在のページがアクティブになる", async () => {
	render(<CustomerPagination currentPage={2} totalPages={5} />);

	const currentPageButton = page.getByRole("button", { name: "2" });
	await expect
		.element(currentPageButton)
		.toHaveAttribute("aria-current", "page");
});

test("次のページに移動できる", async () => {
	render(<CustomerPagination currentPage={1} totalPages={5} />);

	const nextButton = page.getByRole("button", { name: "Next" });
	await nextButton.click();

	expect(useRouterMock.push).toHaveBeenCalledWith("/customers?page=2");
});

test("前のページに移動できる", async () => {
	render(<CustomerPagination currentPage={2} totalPages={5} />);

	const prevButton = page.getByRole("button", { name: "Previous" });
	await prevButton.click();

	expect(useRouterMock.push).toHaveBeenCalledWith("/customers?page=1");
});

test("特定のページに移動できる", async () => {
	render(<CustomerPagination currentPage={1} totalPages={5} />);

	const pageButton = page.getByRole("button", { name: "3" });
	await pageButton.click();

	expect(useRouterMock.push).toHaveBeenCalledWith("/customers?page=3");
});

test("最初のページでは前へボタンが無効", async () => {
	render(<CustomerPagination currentPage={1} totalPages={5} />);

	const prevButton = page.getByRole("button", { name: "Previous" });
	await expect.element(prevButton).toBeDisabled();
});

test("最後のページでは次へボタンが無効", async () => {
	render(<CustomerPagination currentPage={5} totalPages={5} />);

	const nextButton = page.getByRole("button", { name: "Next" });
	await expect.element(nextButton).toBeDisabled();
});

test("ページが1ページのみの場合は表示されない", async () => {
	const { container } = render(
		<CustomerPagination currentPage={1} totalPages={1} />,
	);

	expect(container.innerHTML).toBe("");
});

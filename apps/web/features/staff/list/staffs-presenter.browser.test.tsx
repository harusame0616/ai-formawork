import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import type { StaffsListItem } from "./schema";
import { StaffsPresenter } from "./staffs-presenter";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("path"),
	useRouter: vi.fn().mockReturnValue({
		push: vi.fn(),
	}),
	useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

const mockStaffs: StaffsListItem[] = [
	{
		email: "staff1@example.com",
		firstName: "太郎",
		id: "1",
		lastName: "田中",
	},
	{
		email: "staff2@example.com",
		firstName: "花子",
		id: "2",
		lastName: "鈴木",
	},
];

test("スタッフ一覧が表示される", async () => {
	render(<StaffsPresenter page={1} staffs={mockStaffs} totalPages={1} />);

	await expect.element(page.getByText("田中 太郎")).toBeInTheDocument();
	await expect.element(page.getByText("鈴木 花子")).toBeInTheDocument();
	await expect
		.element(page.getByText("staff1@example.com"))
		.toBeInTheDocument();
	await expect
		.element(page.getByText("staff2@example.com"))
		.toBeInTheDocument();
});

test("スタッフが0件の場合、空のメッセージが表示される", async () => {
	render(<StaffsPresenter page={1} staffs={[]} totalPages={0} />);

	await expect
		.element(page.getByText("スタッフが見つかりませんでした"))
		.toBeInTheDocument();
});

test("ページネーションが表示される", async () => {
	render(<StaffsPresenter page={2} staffs={mockStaffs} totalPages={3} />);

	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();
});

test("ページネーションが1ページのみの場合全てのボタンがdisabled", async () => {
	render(<StaffsPresenter page={1} staffs={mockStaffs} totalPages={1} />);

	const paginationElement = page.getByRole("navigation");
	await expect.element(paginationElement).toBeInTheDocument();

	const previousButton = page.getByRole("link", { name: "前へ" });
	await expect.element(previousButton).toHaveAttribute("aria-disabled", "true");

	const pageButton = page.getByRole("link", {
		name: /^1$/,
	});
	await expect.element(pageButton).toHaveAttribute("aria-disabled", "true");

	const nextButton = page.getByRole("link", { name: "次へ" });
	await expect.element(nextButton).toHaveAttribute("aria-disabled", "true");
});

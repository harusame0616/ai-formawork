import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CustomerSearchForm } from "./customer-search-form";

const useRouterMock = vi.hoisted(() => ({
	push: vi.fn(),
}));

const useSearchParamsMock = vi.hoisted(() => ({
	get: vi.fn((_key: string) => null as string | null),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => useRouterMock,
	useSearchParams: () => useSearchParamsMock,
}));

test("検索フォームが正しくレンダリングされる", async () => {
	render(<CustomerSearchForm />);

	await expect
		.element(page.getByPlaceholder("名前、メールアドレス、電話番号で検索"))
		.toBeInTheDocument();
	await expect
		.element(page.getByRole("button", { name: "検索" }))
		.toBeInTheDocument();
});

test("検索キーワードを入力して検索できる", async () => {
	render(<CustomerSearchForm />);

	const input = page.getByPlaceholder("名前、メールアドレス、電話番号で検索");
	await input.fill("test keyword");

	const submitButton = page.getByRole("button", { name: "検索" });
	await submitButton.click();

	expect(useRouterMock.push).toHaveBeenCalledWith(
		"/customers?keyword=test+keyword",
	);
});

test("空の検索キーワードで検索できる", async () => {
	render(<CustomerSearchForm />);

	const submitButton = page.getByRole("button", { name: "検索" });
	await submitButton.click();

	expect(useRouterMock.push).toHaveBeenCalledWith("/customers?");
});

test("初期値として検索パラメータが表示される", async () => {
	useSearchParamsMock.get.mockReturnValueOnce("initial keyword");

	render(<CustomerSearchForm />);

	const input = page.getByPlaceholder("名前、メールアドレス、電話番号で検索");
	await expect.element(input).toHaveValue("initial keyword");
});

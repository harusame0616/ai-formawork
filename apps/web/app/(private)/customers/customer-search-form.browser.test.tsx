import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH } from "../../../features/customer/schema";
import { CustomerSearchForm } from "./customer-search-form";

// Next.js routerをモック
const getMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
	useSearchParams: () => ({
		get: getMock,
	}),
}));

test("既存のキーワードが初期値として設定される", async () => {
	getMock.mockReturnValue("initial keyword");

	render(<CustomerSearchForm />);

	const input = page.getByLabelText("検索キーワード");
	await expect.element(input).toHaveValue("initial keyword");
});

test("最大文字数を超えて入力できない", async () => {
	render(<CustomerSearchForm />);

	const input = page.getByLabelText("検索キーワード");

	// 最大文字数+1文字の文字列を作成
	const overLimitText = "あ".repeat(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH + 1);

	// 入力を試みる
	await userEvent.fill(input, overLimitText);

	// 最大文字数までしか入力されていないことを確認
	await expect
		.element(input)
		.toHaveValue("あ".repeat(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH));
});

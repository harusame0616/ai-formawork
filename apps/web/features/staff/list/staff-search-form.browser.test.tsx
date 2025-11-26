import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { StaffSearchForm } from "./staff-search-form-presenter";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(),
	}),
}));

const MAX_KEYWORD_LENGTH = 300;

test("最大文字数を超えて入力できない", async () => {
	render(<StaffSearchForm condition={{ keyword: "" }} />);

	const input = page.getByLabelText("検索キーワード");

	const overLimitText = "あ".repeat(MAX_KEYWORD_LENGTH + 1);

	await userEvent.fill(input, overLimitText);

	await expect.element(input).toHaveValue("あ".repeat(MAX_KEYWORD_LENGTH));
});

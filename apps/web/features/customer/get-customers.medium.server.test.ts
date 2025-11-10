import { expect, test, vi } from "vitest";
import { getCustomers } from "./get-customers";

// Next.jsのキャッシュAPIをモック
vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

test("複数フィールドにマッチする検索ができる", async () => {
	const result = await getCustomers({
		keyword: "test",
		page: 1,
	});

	// test1, test2, test3 のメールアドレスを持つ3件がマッチする
	expect(result.customers.length).toBeGreaterThanOrEqual(3);
});

test("大文字小文字を区別せずに検索できる", async () => {
	const result = await getCustomers({
		keyword: "TEST1@EXAMPLE",
		page: 1,
	});

	expect(result.customers).toHaveLength(1);
	expect(result.customers[0]?.email).toBe("test1@example.com");
});

test("デフォルト値が適用される", async () => {
	const result = await getCustomers({ page: 1 });
	expect(result.page).toBe(1);
});

test("範囲外のページ番号(totalPagesを超える値)で空の結果が返る", async () => {
	const result = await getCustomers({ page: 999 });

	// 存在しないページ番号のため、空の結果が返る
	expect(result.customers).toHaveLength(0);
	expect(result.page).toBe(999);
});

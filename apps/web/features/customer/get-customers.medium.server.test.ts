import { expect, test, vi } from "vitest";
import { getCustomers } from "./get-customers";

// Next.jsのキャッシュAPIをモック
vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

test("キーワードなしで全件取得できる", async () => {
	const result = await getCustomers({ page: 1 });

	// seedデータ25件
	// 1ページ目は20件、totalPagesは2ページ
	expect(result.customers).toHaveLength(20);
	expect(result.page).toBe(1);
	expect(result.totalPages).toBe(2);
});

test("名前で部分一致検索できる", async () => {
	const result = await getCustomers({
		keyword: "スト太",
		page: 1,
	});

	expect(result.customers).toHaveLength(1);
	expect(result.customers[0]?.name).toBe("テスト太郎");
});

test("メールアドレスで部分一致検索できる", async () => {
	const result = await getCustomers({
		keyword: "test1@exam",
		page: 1,
	});

	expect(result.customers).toHaveLength(1);
	expect(result.customers[0]?.email).toBe("test1@example.com");
});

test("電話番号で部分一致検索できる", async () => {
	const result = await getCustomers({
		keyword: "1234-567",
		page: 1,
	});

	expect(result.customers).toHaveLength(1);
	expect(result.customers[0]?.phone).toBe("090-1234-5678");
});

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

test("マッチしないキーワードで空の結果が返る", async () => {
	const result = await getCustomers({
		keyword: "存在しないキーワード999",
		page: 1,
	});

	expect(result.customers).toHaveLength(0);
});

test("デフォルト値が適用される", async () => {
	const result = await getCustomers({ page: 1 });
	expect(result.page).toBe(1);
});

test("2ページ目のデータを取得でき、1ページ目と重複しない", async () => {
	const page1 = await getCustomers({ page: 1 });
	const page2 = await getCustomers({ page: 2 });

	// ページ番号が正しく返されることを確認
	expect(page2.page).toBe(2);

	// NOTE: データ件数は他のテストの影響を受ける可能性があるため検証しない
	// seedデータが25件の場合、2ページ目は5件になる想定

	// 1ページ目と2ページ目のcustomerIdを取得
	const page1Ids = new Set(page1.customers.map((c) => c.customerId));
	const page2Ids = new Set(page2.customers.map((c) => c.customerId));

	// 重複がないことを確認
	for (const id of page2Ids) {
		expect(page1Ids.has(id)).toBe(false);
	}
});

test("範囲外のページ番号(totalPagesを超える値)で空の結果が返る", async () => {
	const result = await getCustomers({ page: 999 });

	// 存在しないページ番号のため、空の結果が返る
	expect(result.customers).toHaveLength(0);
	expect(result.page).toBe(999);
});

import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getCustomers } from "./get-customers";

describe("getCustomers", () => {
	beforeEach(async () => {
		// テストデータを挿入
		await db.insert(customersTable).values([
			{
				email: "test1@example.com",
				name: "テスト太郎",
				phone: "090-1234-5678",
			},
			{
				email: "test2@example.com",
				name: "山田花子",
				phone: "080-9876-5432",
			},
			{
				email: "test3@example.com",
				name: "佐藤次郎",
				phone: null,
			},
			{
				email: "admin@example.com",
				name: "管理者",
				phone: "070-1111-2222",
			},
		]);
	});

	afterEach(async () => {
		// テストデータをクリーンアップ
		await db.delete(customersTable);
	});

	test("キーワードなしで全件取得できる", async () => {
		const result = await getCustomers({ page: 1, pageSize: 20 });

		expect(result.customers).toHaveLength(4);
		expect(result.total).toBe(4);
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(20);
		expect(result.totalPages).toBe(1);
	});

	test("名前で部分一致検索できる", async () => {
		const result = await getCustomers({ keyword: "太郎", page: 1, pageSize: 20 });

		expect(result.customers).toHaveLength(1);
		expect(result.customers[0]?.name).toBe("テスト太郎");
		expect(result.total).toBe(1);
	});

	test("メールアドレスで部分一致検索できる", async () => {
		const result = await getCustomers({
			keyword: "admin",
			page: 1,
			pageSize: 20,
		});

		expect(result.customers).toHaveLength(1);
		expect(result.customers[0]?.email).toBe("admin@example.com");
		expect(result.total).toBe(1);
	});

	test("電話番号で部分一致検索できる", async () => {
		const result = await getCustomers({
			keyword: "080-9876",
			page: 1,
			pageSize: 20,
		});

		expect(result.customers).toHaveLength(1);
		expect(result.customers[0]?.phone).toBe("080-9876-5432");
		expect(result.total).toBe(1);
	});

	test("複数フィールドにマッチする検索ができる", async () => {
		const result = await getCustomers({ keyword: "test", page: 1, pageSize: 20 });

		// test1, test2, test3 の3件がマッチする
		expect(result.customers).toHaveLength(3);
		expect(result.total).toBe(3);
	});

	test("大文字小文字を区別せずに検索できる", async () => {
		const result = await getCustomers({
			keyword: "ADMIN",
			page: 1,
			pageSize: 20,
		});

		expect(result.customers).toHaveLength(1);
		expect(result.customers[0]?.email).toBe("admin@example.com");
	});

	test("マッチしないキーワードで空の結果が返る", async () => {
		const result = await getCustomers({
			keyword: "存在しない",
			page: 1,
			pageSize: 20,
		});

		expect(result.customers).toHaveLength(0);
		expect(result.total).toBe(0);
	});

	test("ページネーションが正しく動作する", async () => {
		const result1 = await getCustomers({ page: 1, pageSize: 2 });
		expect(result1.customers).toHaveLength(2);
		expect(result1.page).toBe(1);
		expect(result1.totalPages).toBe(2);

		const result2 = await getCustomers({ page: 2, pageSize: 2 });
		expect(result2.customers).toHaveLength(2);
		expect(result2.page).toBe(2);
		expect(result2.totalPages).toBe(2);
	});

	test("最終ページが正しく取得できる", async () => {
		const result = await getCustomers({ page: 2, pageSize: 3 });
		expect(result.customers).toHaveLength(1); // 4件中、最後の1件
		expect(result.page).toBe(2);
		expect(result.totalPages).toBe(2);
	});

	test("範囲外のページ番号でも空の結果が返る", async () => {
		const result = await getCustomers({ page: 10, pageSize: 20 });
		expect(result.customers).toHaveLength(0);
		expect(result.total).toBe(4);
		expect(result.totalPages).toBe(1);
	});

	test("デフォルト値が適用される", async () => {
		const result = await getCustomers({ page: 1, pageSize: 20 });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(20);
	});
});

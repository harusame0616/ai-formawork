import { describe, test, expect, beforeEach } from "vitest";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { searchCustomers } from "./search-customers";

describe("searchCustomers", () => {
	beforeEach(async () => {
		// テストデータをクリア
		await db.delete(customersTable);

		// テストデータを挿入
		await db.insert(customersTable).values([
			{
				name: "山田太郎",
				email: "yamada@example.com",
				phoneNumber: "090-1234-5678",
			},
			{
				name: "佐藤花子",
				email: "sato@example.com",
				phoneNumber: "080-9876-5432",
			},
			{
				name: "鈴木一郎",
				email: "suzuki@example.com",
				phoneNumber: null,
			},
		]);
	});

	test("全顧客を取得できる", async () => {
		const result = await searchCustomers({ page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(3);
			expect(result.data.totalCount).toBe(3);
			expect(result.data.page).toBe(1);
			expect(result.data.pageSize).toBe(20);
			expect(result.data.totalPages).toBe(1);
		}
	});

	test("名前で検索できる", async () => {
		const result = await searchCustomers({ keyword: "山田", page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(1);
			expect(result.data.customers[0]?.name).toBe("山田太郎");
			expect(result.data.totalCount).toBe(1);
		}
	});

	test("メールアドレスで検索できる", async () => {
		const result = await searchCustomers({ keyword: "sato@", page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(1);
			expect(result.data.customers[0]?.email).toBe("sato@example.com");
		}
	});

	test("電話番号で検索できる", async () => {
		const result = await searchCustomers({ keyword: "090-1234", page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(1);
			expect(result.data.customers[0]?.phoneNumber).toBe("090-1234-5678");
		}
	});

	test("大文字小文字を区別せず検索できる", async () => {
		const result = await searchCustomers({ keyword: "YAMADA", page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(1);
			expect(result.data.customers[0]?.email).toBe("yamada@example.com");
		}
	});

	test("該当なしの場合は空配列を返す", async () => {
		const result = await searchCustomers({ keyword: "存在しない", page: 1, pageSize: 20 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(0);
			expect(result.data.totalCount).toBe(0);
		}
	});

	test("ページネーションが正しく動作する", async () => {
		// 追加のテストデータを挿入
		for (let i = 4; i <= 25; i++) {
			await db.insert(customersTable).values({
				name: `テストユーザー${i}`,
				email: `test${i}@example.com`,
				phoneNumber: null,
			});
		}

		const result = await searchCustomers({ page: 2, pageSize: 10 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(10);
			expect(result.data.totalCount).toBe(25);
			expect(result.data.page).toBe(2);
			expect(result.data.totalPages).toBe(3);
		}
	});
});

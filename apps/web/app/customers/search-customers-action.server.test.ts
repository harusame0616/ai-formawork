import { describe, test, expect, beforeEach } from "vitest";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { searchCustomersAction } from "./search-customers-action";

describe("searchCustomersAction", () => {
	beforeEach(async () => {
		// テストデータをクリア
		await db.delete(customersTable);

		// テストデータを挿入
		await db.insert(customersTable).values([
			{
				name: "テスト顧客1",
				email: "test1@example.com",
				phoneNumber: "090-1111-1111",
			},
			{
				name: "テスト顧客2",
				email: "test2@example.com",
				phoneNumber: "090-2222-2222",
			},
		]);
	});

	test("正常なパラメータで顧客一覧を取得できる", async () => {
		const result = await searchCustomersAction({
			keyword: "",
			page: 1,
			pageSize: 20,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(2);
			expect(result.data.totalCount).toBe(2);
		}
	});

	test("キーワード検索が動作する", async () => {
		const result = await searchCustomersAction({
			keyword: "テスト顧客1",
			page: 1,
			pageSize: 20,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customers).toHaveLength(1);
			expect(result.data.customers[0]?.name).toBe("テスト顧客1");
		}
	});

	test("不正なページ番号でバリデーションエラーになる", async () => {
		const result = await searchCustomersAction({
			keyword: "",
			page: 0,
			pageSize: 20,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("VALIDATION_ERROR");
		}
	});

	test("不正なページサイズでバリデーションエラーになる", async () => {
		const result = await searchCustomersAction({
			keyword: "",
			page: 1,
			pageSize: 101,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("VALIDATION_ERROR");
		}
	});
});

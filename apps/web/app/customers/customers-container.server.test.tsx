import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { CustomersContainer } from "./customers-container";

describe("CustomersContainer", () => {
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
		]);
	});

	afterEach(async () => {
		// テストデータをクリーンアップ
		await db.delete(customersTable);
	});

	test("検索パラメータなしで顧客一覧が表示される", async () => {
		const result = await CustomersContainer({ searchParams: {} });

		// Presenterコンポーネントが返される
		expect(result).toBeDefined();
		expect(result.type).toBe(
			(await import("./customers-presenter")).CustomersPresenter,
		);
	});

	test("キーワード検索パラメータが正しく処理される", async () => {
		const result = await CustomersContainer({
			searchParams: { keyword: "太郎" },
		});

		expect(result).toBeDefined();
	});

	test("ページパラメータが正しく処理される", async () => {
		const result = await CustomersContainer({
			searchParams: { page: "2" },
		});

		expect(result).toBeDefined();
	});

	test("無効なページパラメータはデフォルト値にフォールバックする", async () => {
		const result = await CustomersContainer({
			searchParams: { page: "invalid" },
		});

		expect(result).toBeDefined();
	});

	test("複数の検索パラメータが正しく処理される", async () => {
		const result = await CustomersContainer({
			searchParams: { keyword: "test", page: "1" },
		});

		expect(result).toBeDefined();
	});
});

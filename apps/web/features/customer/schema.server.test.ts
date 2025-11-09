import { describe, test, expect } from "vitest";
import * as v from "valibot";
import { searchCustomersSchema } from "./schema";

describe("searchCustomersSchema", () => {
	test("デフォルト値でバリデーションに成功する", () => {
		const result = v.safeParse(searchCustomersSchema, {});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output).toEqual({
				keyword: undefined,
				page: 1,
				pageSize: 20,
			});
		}
	});

	test("キーワードありでバリデーションに成功する", () => {
		const result = v.safeParse(searchCustomersSchema, {
			keyword: "test",
			page: 2,
			pageSize: 10,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output).toEqual({
				keyword: "test",
				page: 2,
				pageSize: 10,
			});
		}
	});

	test("ページ番号が0以下の場合バリデーションに失敗する", () => {
		const result = v.safeParse(searchCustomersSchema, {
			page: 0,
		});
		expect(result.success).toBe(false);
	});

	test("ページサイズが0以下の場合バリデーションに失敗する", () => {
		const result = v.safeParse(searchCustomersSchema, {
			pageSize: 0,
		});
		expect(result.success).toBe(false);
	});

	test("ページサイズが100を超える場合バリデーションに失敗する", () => {
		const result = v.safeParse(searchCustomersSchema, {
			pageSize: 101,
		});
		expect(result.success).toBe(false);
	});
});

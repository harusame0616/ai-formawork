import { test as base, expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { inArray } from "drizzle-orm";

type CustomersFixture = {
	testCustomers: Array<{
		name: string;
		email: string;
		phoneNumber: string | null;
	}>;
};

const test = base.extend<CustomersFixture>({
	testCustomers: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		// テストデータを作成
		const testData = [
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
		];

		// データを挿入
		await db.insert(customersTable).values(testData);

		await use(testData);

		// クリーンアップ（テスト用のデータを削除）
		await db
			.delete(customersTable)
			.where(
				inArray(
					customersTable.email,
					testData.map((d) => d.email),
				),
			);
	},
});

test("顧客一覧ページが正しく表示される", async ({ page, testCustomers }) => {
	await test.step("ページに遷移", async () => {
		await page.goto("http://localhost:3000/customers");
		await expect(page).toHaveURL(/\/customers/);
	});

	await test.step("タイトルが表示される", async () => {
		await expect(page.getByRole("heading", { name: "顧客一覧" })).toBeVisible();
	});

	await test.step("検索フォームが表示される", async () => {
		await expect(
			page.getByPlaceholder("名前、メールアドレス、電話番号で検索"),
		).toBeVisible();
		await expect(page.getByRole("button", { name: /検索/ })).toBeVisible();
	});

	await test.step("顧客データが表示される", async () => {
		// テーブルが表示される
		await expect(page.getByRole("table")).toBeVisible();

		// テストデータが表示されることを確認
		await expect(page.getByText("山田太郎")).toBeVisible();
		await expect(page.getByText("yamada@example.com")).toBeVisible();
		await expect(page.getByText("090-1234-5678")).toBeVisible();
	});
});

test("名前で検索できる", async ({ page, testCustomers }) => {
	await test.step("ページに遷移", async () => {
		await page.goto("http://localhost:3000/customers");
	});

	await test.step("名前で検索", async () => {
		await page
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("山田");
		await page.getByRole("button", { name: /検索/ }).click();
		await page.waitForURL(/keyword=山田/);
	});

	await test.step("検索結果が表示される", async () => {
		await expect(page.getByText("山田太郎")).toBeVisible();
		await expect(page.getByText("佐藤花子")).not.toBeVisible();
	});
});

test("メールアドレスで検索できる", async ({ page, testCustomers }) => {
	await test.step("ページに遷移", async () => {
		await page.goto("http://localhost:3000/customers");
	});

	await test.step("メールアドレスで検索", async () => {
		await page
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("sato@");
		await page.getByRole("button", { name: /検索/ }).click();
		await page.waitForURL(/keyword=sato/);
	});

	await test.step("検索結果が表示される", async () => {
		await expect(page.getByText("佐藤花子")).toBeVisible();
		await expect(page.getByText("山田太郎")).not.toBeVisible();
	});
});

test("電話番号で検索できる", async ({ page, testCustomers }) => {
	await test.step("ページに遷移", async () => {
		await page.goto("http://localhost:3000/customers");
	});

	await test.step("電話番号で検索", async () => {
		await page
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("090-1234");
		await page.getByRole("button", { name: /検索/ }).click();
		await page.waitForURL(/keyword=090-1234/);
	});

	await test.step("検索結果が表示される", async () => {
		await expect(page.getByText("山田太郎")).toBeVisible();
		await expect(page.getByText("090-1234-5678")).toBeVisible();
		await expect(page.getByText("佐藤花子")).not.toBeVisible();
	});
});

test("該当なしの場合にメッセージが表示される", async ({ page }) => {
	await test.step("ページに遷移", async () => {
		await page.goto("http://localhost:3000/customers");
	});

	await test.step("存在しないキーワードで検索", async () => {
		await page
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("存在しない顧客");
		await page.getByRole("button", { name: /検索/ }).click();
		await page.waitForURL(/keyword/);
	});

	await test.step("該当なしメッセージが表示される", async () => {
		await expect(
			page.getByText("該当する顧客が見つかりませんでした"),
		).toBeVisible();
	});
});

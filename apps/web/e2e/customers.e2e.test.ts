import { expect, test } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { inArray } from "drizzle-orm";

test.describe("顧客一覧ページ", () => {
	const testCustomers = [
		{
			customerId: crypto.randomUUID(),
			email: "e2e-alice@example.com",
			name: "E2E Alice",
			phoneNumber: "090-1111-1111",
		},
		{
			customerId: crypto.randomUUID(),
			email: "e2e-bob@example.com",
			name: "E2E Bob",
			phoneNumber: "090-2222-2222",
		},
		{
			customerId: crypto.randomUUID(),
			email: "e2e-charlie@example.com",
			name: "E2E Charlie",
			phoneNumber: "090-3333-3333",
		},
		...Array.from({ length: 25 }, (_, i) => ({
			customerId: crypto.randomUUID(),
			email: `e2e-user${i}@example.com`,
			name: `E2E User ${i}`,
			phoneNumber: `090-0000-${String(i).padStart(4, "0")}`,
		})),
	];

	test.beforeAll(async () => {
		await db.insert(customersTable).values(testCustomers);
	});

	test.afterAll(async () => {
		await db.delete(customersTable).where(
			inArray(
				customersTable.customerId,
				testCustomers.map((c) => c.customerId),
			),
		);
	});

	test("顧客一覧が表示される", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
			await expect(
				page.getByRole("heading", { name: "顧客一覧" }),
			).toBeVisible();
		});

		await test.step("顧客データが表示される", async () => {
			await expect(page.getByRole("cell", { name: "E2E Alice" })).toBeVisible();
			await expect(
				page.getByRole("cell", { name: "e2e-alice@example.com" }),
			).toBeVisible();
			await expect(
				page.getByRole("cell", { name: "090-1111-1111" }),
			).toBeVisible();
		});
	});

	test("名前で検索できる", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
		});

		await test.step("検索キーワードを入力", async () => {
			await page
				.getByPlaceholder("名前、メールアドレス、電話番号で検索")
				.fill("E2E Alice");
		});

		await test.step("検索ボタンをクリック", async () => {
			await page.getByRole("button", { name: "検索" }).click();
		});

		await test.step("検索結果が表示される", async () => {
			await expect(page.getByRole("cell", { name: "E2E Alice" })).toBeVisible();
			await expect(
				page.getByRole("cell", { name: "E2E Bob" }),
			).not.toBeVisible();
		});
	});

	test("メールアドレスで検索できる", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
		});

		await test.step("検索キーワードを入力してボタンをクリック", async () => {
			await page
				.getByPlaceholder("名前、メールアドレス、電話番号で検索")
				.fill("e2e-bob@example.com");
			await page.getByRole("button", { name: "検索" }).click();
		});

		await test.step("検索結果が表示される", async () => {
			await expect(page.getByRole("cell", { name: "E2E Bob" })).toBeVisible();
			await expect(
				page.getByRole("cell", { name: "E2E Alice" }),
			).not.toBeVisible();
		});
	});

	test("電話番号で検索できる", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
		});

		await test.step("検索キーワードを入力してボタンをクリック", async () => {
			await page
				.getByPlaceholder("名前、メールアドレス、電話番号で検索")
				.fill("090-3333");
			await page.getByRole("button", { name: "検索" }).click();
		});

		await test.step("検索結果が表示される", async () => {
			await expect(
				page.getByRole("cell", { name: "E2E Charlie" }),
			).toBeVisible();
		});
	});

	test("ページネーションが正しく動作する", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
		});

		await test.step("ページネーションが表示される", async () => {
			await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
		});

		await test.step("2ページ目に移動", async () => {
			await page.getByRole("button", { name: "2" }).click();
			await page.waitForURL(/page=2/);
		});

		await test.step("2ページ目の内容が表示される", async () => {
			await expect(
				page.getByRole("button", { name: "Previous" }),
			).toBeEnabled();
		});

		await test.step("前のページに戻る", async () => {
			await page.getByRole("button", { name: "Previous" }).click();
			await page.waitForURL(/customers/);
		});
	});

	test("検索結果が0件の場合のメッセージが表示される", async ({ page }) => {
		await test.step("顧客一覧ページに移動", async () => {
			await page.goto("/customers");
		});

		await test.step("存在しないキーワードで検索", async () => {
			await page
				.getByPlaceholder("名前、メールアドレス、電話番号で検索")
				.fill("nonexistent-customer-xyz-999");
			await page.getByRole("button", { name: "検索" }).click();
		});

		await test.step("0件メッセージが表示される", async () => {
			await expect(page.getByText("顧客が見つかりませんでした")).toBeVisible();
		});
	});
});

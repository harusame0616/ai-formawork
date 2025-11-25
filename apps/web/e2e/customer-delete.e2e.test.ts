import { test as base, expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";

type Fixtures = {
	customer: {
		customerId: string;
		email: string;
		name: string;
		phone: string;
	};
	adminUserPage: Page;
	normalUserPage: Page;
};

const test = base.extend<Fixtures>({
	async adminUserPage({ page }, use) {
		const adminUser = {
			email: "admin@example.com",
			password: "Admin@789!",
		};

		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(adminUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(adminUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},
	// biome-ignore lint/correctness/noEmptyPattern: The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "_".
	async customer({}, use) {
		const customer = {
			customerId: v4(),
			email: `${v4()}@example.com`,
			name: v4().slice(0, 24),
			phone: `${Math.floor(Math.random() * 1000000000)}`,
		};

		await db.insert(customersTable).values(customer);
		await use(customer);
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customer.customerId));
	},

	async normalUserPage({ page }, use) {
		const testUser = {
			email: "test1@example.com",
			password: "Test@Pass123",
		};

		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},
});

test("管理者が顧客を削除できる", async ({ adminUserPage: page, customer }) => {
	await test.step("顧客詳細ページに遷移", async () => {
		await page.goto(`/customers/${customer.customerId}`);
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("削除実行", async () => {
		await page.getByRole("button", { name: "削除" }).click();
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
		await page.waitForURL("/customers");
	});

	await test.step("削除された顧客を検索してもヒットしないことを確認", async () => {
		await page.getByLabel("検索キーワード").fill(customer.name);
		await page.getByRole("button", { name: "検索" }).click();

		// 「顧客が見つかりませんでした」が表示される
		await expect(page.getByText("顧客が見つかりませんでした")).toBeVisible();
	});
});

test("一般ユーザーには顧客削除ボタンが表示されない", async ({
	normalUserPage: page,
	customer,
}) => {
	await test.step("顧客詳細ページに遷移", async () => {
		await page.goto(`/customers/${customer.customerId}`);
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByRole("link", { name: "編集" })).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

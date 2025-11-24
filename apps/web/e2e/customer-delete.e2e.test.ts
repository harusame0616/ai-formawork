import { test as base, expect } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";

const test = base.extend<{
	customer: {
		customerId: string;
		email: string;
		name: string;
		phone: string;
	};
}>({
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
});

test("管理者が顧客を削除できる", async ({ page, customer }) => {
	const adminUser = {
		email: "admin@example.com",
		password: "Admin@789!",
	};

	await test.step("管理者でログイン", async () => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(adminUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(adminUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
	});

	await test.step("顧客詳細ページに遷移", async () => {
		await page.goto(`/customers/${customer.customerId}`);
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("顧客詳細ページで削除ボタンをクリック", async () => {
		// 削除ボタンが表示されることを確認
		const deleteButton = page.getByRole("button", { name: "削除" });
		await expect(deleteButton).toBeVisible();

		await deleteButton.click();

		// 削除確認ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "顧客を削除" }),
		).toBeVisible();
		await expect(
			dialog.getByText(
				"この顧客を削除してもよろしいですか？関連するすべてのノートと画像も削除されます。この操作は取り消せません。",
			),
		).toBeVisible();
	});

	await test.step("確認ダイアログで削除を実行", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByRole("button", { name: "削除" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();

		// 顧客一覧ページにリダイレクトされることを確認
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
	page,
	customer,
}) => {
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};

	await test.step("一般ユーザーでログイン", async () => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
	});

	await test.step("顧客詳細ページに遷移", async () => {
		await page.goto(`/customers/${customer.customerId}`);
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		// 編集リンクは表示される
		await expect(page.getByRole("link", { name: "編集" })).toBeVisible();

		// 削除ボタンは表示されない
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

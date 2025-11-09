import { test as base, expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";

type CustomerPageFixture = {
	createCustomerPage: Page;
};

const test = base.extend<CustomerPageFixture>({
	createCustomerPage: async ({ page }, use) => {
		await page.goto("/customers/create");
		await page.waitForURL("/customers/create");
		await use(page);
	},
});

test("正しい顧客情報を入力すると顧客一覧ページにリダイレクトされ、登録した顧客が表示される", async ({
	createCustomerPage,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const testCustomer = {
		email: `test-${randomString}@example.com`,
		name: `テスト太郎${randomString}`,
	};

	await test.step("有効な顧客名とメールアドレスを入力", async () => {
		await createCustomerPage.getByLabel("顧客名").fill(testCustomer.name);
		await createCustomerPage
			.getByRole("textbox", { name: "メールアドレス" })
			.fill(testCustomer.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await createCustomerPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(createCustomerPage).toHaveURL("/customers");
	});

	await test.step("登録した顧客が一覧に表示されることを確認", async () => {
		await expect(createCustomerPage.getByText(testCustomer.name)).toBeVisible();
		await expect(
			createCustomerPage.getByText(testCustomer.email),
		).toBeVisible();
	});

	// クリーンアップ
	await db
		.delete(customersTable)
		.where(eq(customersTable.email, testCustomer.email));
});

test("既に登録されているメールアドレスで登録しようとするとエラーメッセージが表示される", async ({
	createCustomerPage,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const testCustomer = {
		email: `duplicate-${randomString}@example.com`,
		name: `重複太郎${randomString}`,
	};

	// 事前に顧客を登録
	await db.insert(customersTable).values({
		email: testCustomer.email,
		name: testCustomer.name,
	});

	await test.step("既存のメールアドレスで登録を試みる", async () => {
		await createCustomerPage.getByLabel("顧客名").fill("別の太郎");
		await createCustomerPage
			.getByRole("textbox", { name: "メールアドレス" })
			.fill(testCustomer.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await createCustomerPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(createCustomerPage.getByRole("alert")).toBeVisible();
		await expect(
			createCustomerPage.getByText("このメールアドレスは既に登録されています"),
		).toBeVisible();
	});

	// クリーンアップ
	await db
		.delete(customersTable)
		.where(eq(customersTable.email, testCustomer.email));
});

test("顧客情報を編集できる", async ({ page }) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const originalCustomer = {
		email: `original-${randomString}@example.com`,
		name: `元太郎${randomString}`,
	};
	const updatedCustomer = {
		email: `updated-${randomString}@example.com`,
		name: `更新太郎${randomString}`,
	};

	await test.step("テスト用の顧客を作成", async () => {
		const [customer] = await db
			.insert(customersTable)
			.values({
				email: originalCustomer.email,
				name: originalCustomer.name,
			})
			.returning();

		if (!customer) {
			throw new Error("顧客の作成に失敗しました");
		}

		await page.goto(`/customers/${customer.customerId}/edit`);
		await page.waitForURL(`/customers/${customer.customerId}/edit`);
	});

	await test.step("フォームに元の値が表示されていることを確認", async () => {
		await expect(page.getByLabel("顧客名")).toHaveValue(originalCustomer.name);
		await expect(
			page.getByRole("textbox", { name: "メールアドレス" }),
		).toHaveValue(originalCustomer.email);
	});

	await test.step("顧客情報を更新", async () => {
		await page.getByLabel("顧客名").fill(updatedCustomer.name);
		await page
			.getByRole("textbox", { name: "メールアドレス" })
			.fill(updatedCustomer.email);
	});

	await test.step("更新ボタンをクリック", async () => {
		await page.getByRole("button", { name: "更新する" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(page).toHaveURL("/customers");
	});

	await test.step("更新した顧客情報が一覧に表示されることを確認", async () => {
		await expect(page.getByText(updatedCustomer.name)).toBeVisible();
		await expect(page.getByText(updatedCustomer.email)).toBeVisible();
		await expect(page.getByText(originalCustomer.name)).not.toBeVisible();
	});

	// クリーンアップ
	await db
		.delete(customersTable)
		.where(eq(customersTable.email, updatedCustomer.email));
});

test("最大文字数の顧客名（100文字）で登録できる", async ({
	createCustomerPage,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const boundaryCustomer = {
		email: `boundary-${randomString}@example.com`,
		name: "あ".repeat(100),
	};

	await test.step("100文字の顧客名と有効なメールアドレスを入力", async () => {
		await createCustomerPage.getByLabel("顧客名").fill(boundaryCustomer.name);
		await createCustomerPage
			.getByRole("textbox", { name: "メールアドレス" })
			.fill(boundaryCustomer.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await createCustomerPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(createCustomerPage).toHaveURL("/customers");
	});

	await test.step("登録した顧客が一覧に表示されることを確認", async () => {
		await expect(
			createCustomerPage.getByText(boundaryCustomer.name),
		).toBeVisible();
	});

	// クリーンアップ
	await db
		.delete(customersTable)
		.where(eq(customersTable.email, boundaryCustomer.email));
});

test("最大文字数のメールアドレス（254文字）で登録できる", async ({
	createCustomerPage,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const padding = "a".repeat(242 - randomString.length);
	const boundaryCustomer = {
		email: `${randomString}${padding}@example.com`, // 254文字
		name: "境界太郎",
	};

	await test.step("有効な顧客名と254文字のメールアドレスを入力", async () => {
		await createCustomerPage.getByLabel("顧客名").fill(boundaryCustomer.name);
		await createCustomerPage
			.getByRole("textbox", { name: "メールアドレス" })
			.fill(boundaryCustomer.email);
	});

	await test.step("登録ボタンをクリック", async () => {
		await createCustomerPage.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(createCustomerPage).toHaveURL("/customers");
	});

	await test.step("登録した顧客が一覧に表示されることを確認", async () => {
		await expect(
			createCustomerPage.getByText(boundaryCustomer.email),
		).toBeVisible();
	});

	// クリーンアップ
	await db
		.delete(customersTable)
		.where(eq(customersTable.email, boundaryCustomer.email));
});

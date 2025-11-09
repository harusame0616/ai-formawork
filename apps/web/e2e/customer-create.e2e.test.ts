import { test as base, expect, type Page } from "@playwright/test";
import { db, eq } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";

type CustomerNewPageFixture = {
	customerNewPage: Page;
	createdCustomerEmails: string[];
};

const test = base.extend<CustomerNewPageFixture>({
	createdCustomerEmails: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const emails: string[] = [];
		await use(emails);

		// クリーンアップ: テスト中に作成された顧客を削除
		for (const email of emails) {
			await db.delete(customersTable).where(eq(customersTable.email, email));
		}
	},

	customerNewPage: async ({ page }, use) => {
		await page.goto("/customers/new");
		await page.waitForURL("/customers/new");
		await use(page);
	},
});

test("有効な顧客情報を入力すると顧客一覧ページにリダイレクトされる", async ({
	customerNewPage,
	createdCustomerEmails,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const testEmail = `test-${randomString}@example.com`;
	createdCustomerEmails.push(testEmail);

	await test.step("有効な顧客名とメールアドレスを入力", async () => {
		await customerNewPage.getByLabel("顧客名").fill("Test Customer");
		await customerNewPage.getByLabel("メールアドレス").fill(testEmail);
	});

	await test.step("登録ボタンをクリック", async () => {
		await customerNewPage.getByRole("button", { name: "登録" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(customerNewPage).toHaveURL("/customers");
	});
});

test("既に登録されているメールアドレスを入力するとエラーメッセージが表示される", async ({
	customerNewPage,
	createdCustomerEmails,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const testEmail = `duplicate-${randomString}@example.com`;
	createdCustomerEmails.push(testEmail);

	await test.step("既存の顧客を作成", async () => {
		await db.insert(customersTable).values({
			email: testEmail,
			name: "Existing Customer",
		});
	});

	await test.step("同じメールアドレスで登録を試みる", async () => {
		await customerNewPage.getByLabel("顧客名").fill("Test Customer");
		await customerNewPage.getByLabel("メールアドレス").fill(testEmail);
		await customerNewPage.getByRole("button", { name: "登録" }).click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(customerNewPage.getByRole("alert")).toBeVisible();
		await expect(
			customerNewPage.getByText("このメールアドレスは既に登録されています"),
		).toBeVisible();
	});
});

test("最大文字数の顧客名（100文字）で登録できる", async ({
	customerNewPage,
	createdCustomerEmails,
}) => {
	const randomString = Math.random().toString(36).substring(2, 15);
	const testEmail = `boundary-name-${randomString}@example.com`;
	createdCustomerEmails.push(testEmail);

	await test.step("100文字の顧客名と有効なメールアドレスを入力", async () => {
		const boundaryName = "a".repeat(100);
		await customerNewPage.getByLabel("顧客名").fill(boundaryName);
		await customerNewPage.getByLabel("メールアドレス").fill(testEmail);
	});

	await test.step("登録ボタンをクリック", async () => {
		await customerNewPage.getByRole("button", { name: "登録" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(customerNewPage).toHaveURL("/customers");
	});
});

test("最大文字数のメールアドレス（254文字）で登録できる", async ({
	customerNewPage,
	createdCustomerEmails,
}) => {
	// 254文字のメールアドレス (242 + 1(@) + 11(example.com) = 254文字)
	// ランダムな文字列を生成してユニークなメールアドレスを作成
	const randomString = Math.random().toString(36).substring(2, 15);
	const padding = "a".repeat(242 - randomString.length);
	const testEmail = `${randomString}${padding}@example.com`;
	createdCustomerEmails.push(testEmail);

	await test.step("有効な顧客名と254文字のメールアドレスを入力", async () => {
		await customerNewPage.getByLabel("顧客名").fill("Test Customer");
		await customerNewPage.getByLabel("メールアドレス").fill(testEmail);
	});

	await test.step("登録ボタンをクリック", async () => {
		await customerNewPage.getByRole("button", { name: "登録" }).click();
	});

	await test.step("顧客一覧ページにリダイレクトされることを確認", async () => {
		await expect(customerNewPage).toHaveURL("/customers");
	});
});

import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";

type Fixtures = {
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

		await page.goto("/customers/new");
		await page.waitForURL("/customers/new");

		await use(page);
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

test("管理者が全フィールドを境界値一杯で入力して顧客を登録し、詳細ページへ遷移し、一覧画面で検索できる", async ({
	adminUserPage: page,
}) => {
	const testData = {
		email: `${"a".repeat(64)}@${"example-".repeat(22)}example12.com`,
		name: randomUUID().slice(0, 24),
		phone: "012-3456-7890-123456789",
	};

	await test.step("フォームに境界値一杯のデータを入力", async () => {
		await page.getByLabel("名前").fill(testData.name);
		await page.getByLabel("メールアドレス").fill(testData.email);
		await page.getByLabel("電話番号").fill(testData.phone);
	});

	await test.step("登録ボタンをクリック", async () => {
		await page.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await page.waitForURL("**/customers/*");
	});

	await test.step("登録した情報が正しく表示されることを確認", async () => {
		await expect(page.getByText(testData.name)).toBeVisible();

		const emailLink = page.getByRole("link", {
			name: testData.email,
		});
		await expect(emailLink).toHaveAttribute("href", `mailto:${testData.email}`);

		const expectedPhone = testData.phone.replace(/-/g, "");
		const phoneLink = page.getByRole("link", {
			name: expectedPhone,
		});
		await expect(phoneLink).toBeVisible();
		await expect(phoneLink).toHaveAttribute("href", `tel:${expectedPhone}`);
	});

	await test.step("一覧ページに遷移", async () => {
		await page.goto("/customers");
		await page.waitForURL("/customers");
	});

	await test.step("登録した顧客を検索", async () => {
		await page.getByLabel("キーワード").fill(testData.name);
		await page.getByRole("button", { name: "検索" }).click();
		await page.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果に登録した顧客が表示されることを確認", async () => {
		await expect(page.getByRole("link", { name: testData.name })).toBeVisible();
	});
});

test("管理者が必須フィールドのみ入力して登録でき、詳細ページへ遷移する", async ({
	adminUserPage: page,
}) => {
	const testData = {
		name: randomUUID().slice(0, 24),
	};

	await test.step("必須フィールド（名前）のみ入力", async () => {
		await page.getByLabel("名前").fill(testData.name);
	});

	await test.step("登録ボタンをクリック", async () => {
		await page.getByRole("button", { name: "登録する" }).click();
	});

	await test.step("詳細ページに遷移することを確認", async () => {
		await page.waitForURL("**/customers/*");
	});

	await test.step("登録した情報が正しく表示されることを確認", async () => {
		await expect(page.getByText(testData.name)).toBeVisible();
		await expect(page.getByText("未登録")).toHaveCount(2);
	});
});

test("一般ユーザーには顧客一覧で新規登録リンクが表示されない", async ({
	normalUserPage: page,
}) => {
	await test.step("顧客一覧ページに遷移", async () => {
		await page.goto("/customers");
		await page.waitForURL("/customers");
	});

	await test.step("新規登録リンクが表示されないことを確認", async () => {
		await expect(page.getByRole("link", { name: "新規登録" })).toBeHidden();
	});
});

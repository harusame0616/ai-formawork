import { test as base, expect, type Page } from "@playwright/test";

type LoginPageFixture = {
	loginPage: Page;
};

const test = base.extend<LoginPageFixture>({
	loginPage: async ({ page }, use) => {
		await page.goto("/login");
		await page.waitForURL("/login");
		await use(page);
	},
});

test("正常系：ログイン成功とブラウザバック後の挙動", async ({ loginPage }) => {
	await test.step("有効なメールアドレスとパスワードを入力", async () => {
		await loginPage.getByLabel("メールアドレス").fill("test1@example.com");
		await loginPage
			.getByRole("textbox", { name: "パスワード" })
			.fill("Test@Pass123");
	});

	await test.step("ログインボタンをクリック", async () => {
		await loginPage.getByRole("button", { name: "ログイン" }).click();
	});

	await test.step("ホームページにリダイレクトされることを確認", async () => {
		await expect(loginPage).toHaveURL("/");
	});

	await test.step("ブラウザバックを実行", async () => {
		await loginPage.goBack();
	});

	await test.step("ログインページに戻らないことを確認", async () => {
		await expect(loginPage).toHaveURL("about:blank");
	});
});

test("異常系：認証失敗（無効な認証情報）", async ({ loginPage }) => {
	await test.step("無効な認証情報を入力", async () => {
		await loginPage.getByLabel("メールアドレス").fill("invalid@example.com");
		await loginPage
			.getByRole("textbox", { name: "パスワード" })
			.fill("WrongPassword");
	});

	await test.step("ログインボタンをクリック", async () => {
		await loginPage.getByRole("button", { name: "ログイン" }).click();
	});

	await test.step("エラーメッセージが表示されることを確認", async () => {
		await expect(loginPage.getByRole("alert")).toBeVisible();
	});
});

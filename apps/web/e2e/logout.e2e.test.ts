import { test as base, expect, type Page } from "@playwright/test";

type LogoutFixture = {
	authenticatedPage: Page;
};

const test = base.extend<LogoutFixture>({
	authenticatedPage: async ({ page }, use) => {
		// シードユーザー（admin@example.com）でログイン
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill("admin@example.com");
		await page.getByRole("textbox", { name: "パスワード" }).fill("Admin@789!");
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
		await use(page);
	},
});

test("ログイン後、ログアウトするとログインページにリダイレクトされ、バックしてもホームに戻らない", async ({
	authenticatedPage,
}) => {
	await test.step("ユーザーメニューを開く", async () => {
		await authenticatedPage
			.getByRole("button", { name: "ユーザーメニューを開く" })
			.click();
	});

	await test.step("ログアウトボタンをクリックしてログインページにリダイレクトされることを確認", async () => {
		await authenticatedPage.getByRole("button", { name: "ログアウト" }).click();
		await authenticatedPage.waitForURL("/login");
	});

	await test.step("ブラウザバックしてもホームページに戻らないことを確認", async () => {
		await authenticatedPage.goBack();
		// RedirectType.replace を使用しているため、ホームページには戻らない
		await expect(authenticatedPage).not.toHaveURL("/");
	});
});

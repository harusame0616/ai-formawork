import { test as base, expect, type Page } from "@playwright/test";

type StaffsPageFixture = {
	staffsPage: Page;
	authenticatedPage: Page;
	testUser: {
		email: string;
		password: string;
	};
};

const test = base.extend<StaffsPageFixture>({
	authenticatedPage: async ({ page, testUser }, use) => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},
	staffsPage: async ({ authenticatedPage }, use) => {
		await authenticatedPage.goto("/staffs");
		await authenticatedPage.waitForURL("/staffs");
		await expect(
			authenticatedPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();

		await use(authenticatedPage);
	},
	testUser: [
		{
			email: "test1@example.com",
			password: "Test@Pass123",
		},
		{ option: true },
	],
});

test("メニューからスタッフ一覧ページに遷移できる", async ({
	authenticatedPage,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await authenticatedPage
			.getByRole("button", { name: /^メニューを開く$/ })
			.click();
	});

	await test.step("スタッフ一覧リンクをクリック", async () => {
		await authenticatedPage.getByRole("link", { name: "スタッフ一覧" }).click();
	});

	await test.step("スタッフ一覧ページに遷移することを確認", async () => {
		await expect(authenticatedPage).toHaveURL("/staffs");
		await expect(
			authenticatedPage.getByRole("heading", { name: "スタッフ一覧" }),
		).toBeVisible();
	});
});

test("スタッフ一覧が表示される", async ({ staffsPage }) => {
	await test.step("スタッフが表示されていることを確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
	});

	await test.step("姓、名とメールアドレスが表示されていることを確認", async () => {
		const targetRow = staffsPage
			.locator("table tbody tr")
			.filter({ hasText: "田中" })
			.filter({ hasText: "太郎" });
		await expect(targetRow).toBeVisible();
		await expect(targetRow.getByRole("cell", { name: "田中" })).toBeVisible();
		await expect(targetRow.getByRole("cell", { name: "太郎" })).toBeVisible();
	});
});

test("姓で完全一致検索できる", async ({ staffsPage }) => {
	const searchKeyword = "田中";

	await test.step("姓を入力して検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			staffsPage.getByRole("cell", { name: searchKeyword }),
		).toBeVisible();
	});
});

test("名で完全一致検索できる", async ({ staffsPage }) => {
	const searchKeyword = "太郎";

	await test.step("名を入力して検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果を確認", async () => {
		const rows = staffsPage.locator("table tbody tr");
		const count = await rows.count();
		expect(count).toBeGreaterThan(0);
		await expect(
			staffsPage.getByRole("cell", { name: searchKeyword }),
		).toBeVisible();
	});
});

test("部分一致では検索されない", async ({ staffsPage }) => {
	const searchKeyword = "田";

	await test.step("部分的なキーワードで検索", async () => {
		await staffsPage.getByLabel("キーワード").fill(searchKeyword);
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("検索結果がないことを確認", async () => {
		await expect(
			staffsPage.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});

test("該当するスタッフがいない場合、メッセージが表示される", async ({
	staffsPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await staffsPage.getByLabel("キーワード").fill("存在しないスタッフ");
		await staffsPage.getByRole("button", { name: "検索" }).click();
		await staffsPage.waitForURL("**/staffs?keyword=*");
		await expect(
			staffsPage.getByRole("main").getByText("読み込み中"),
		).toBeHidden();
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			staffsPage.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});

import { test as base, expect, type Page } from "@playwright/test";

type CustomersPageFixture = {
	customersPage: Page;
	authenticatedPage: Page;
	testUser: {
		email: string;
		password: string;
	};
};

const test = base.extend<CustomersPageFixture>({
	authenticatedPage: async ({ page, testUser }, use) => {
		// ログイン処理
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		await use(page);
	},
	customersPage: async ({ authenticatedPage }, use) => {
		// 顧客一覧ページに遷移
		await authenticatedPage.goto("/customers");
		await authenticatedPage.waitForURL("/customers");

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

test("メニューから顧客一覧ページに遷移できる", async ({
	authenticatedPage,
}) => {
	await test.step("メニューボタンをクリックしてメニューを開く", async () => {
		await authenticatedPage
			.getByRole("button", { name: "メニューを開く" })
			.first()
			.click();
		// メニュー内の顧客一覧リンクが表示されることを確認
		await expect(
			authenticatedPage.getByRole("link", { name: "顧客一覧" }),
		).toBeVisible();
	});

	await test.step("顧客一覧リンクをクリック", async () => {
		await authenticatedPage.getByRole("link", { name: "顧客一覧" }).click();
	});

	await test.step("顧客一覧ページに遷移することを確認", async () => {
		await expect(authenticatedPage).toHaveURL("/customers");
		await expect(
			authenticatedPage.getByRole("heading", { name: "顧客一覧" }),
		).toBeVisible();
	});
});

test("顧客一覧ページが正しく表示される", async ({ customersPage }) => {
	await test.step("顧客一覧が表示されることを確認", async () => {
		// CardTitleはdiv要素なのでgetByTextを使用
		await expect(customersPage.getByText("顧客一覧")).toBeVisible();
		// 1ページ目に20件表示されることを確認
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});

	await test.step("検索フォームが表示されることを確認", async () => {
		await expect(customersPage.getByLabel("検索キーワード")).toBeVisible();
		await expect(
			customersPage.getByRole("button", { name: "検索" }),
		).toBeVisible();
	});
});

test("名前で検索できる", async ({ customersPage }) => {
	const searchKeyword = "太郎";

	await test.step("検索キーワードを入力", async () => {
		await customersPage.getByLabel("検索キーワード").fill(searchKeyword);
	});

	await test.step("検索ボタンをクリック", async () => {
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		// 表示されている全てのデータが検索キーワードを含んでいることを確認
		const rows = customersPage.locator("table tbody tr");
		const count = await rows.count();

		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});
});

test("メールアドレスで検索できる", async ({ customersPage }) => {
	const searchKeyword = "admin";

	await test.step("メールアドレスで検索", async () => {
		await customersPage.getByLabel("検索キーワード").fill(searchKeyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		// 表示されている全てのデータが検索キーワードを含んでいることを確認
		const rows = customersPage.locator("table tbody tr");
		const count = await rows.count();

		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});
});

test("電話番号で検索できる", async ({ customersPage }) => {
	const searchKeyword = "080-9876";

	await test.step("電話番号で検索", async () => {
		await customersPage.getByLabel("検索キーワード").fill(searchKeyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		// 表示されている全てのデータが検索キーワードを含んでいることを確認
		const rows = customersPage.locator("table tbody tr");
		const count = await rows.count();

		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});
});

test("該当する顧客がいない場合、メッセージが表示される", async ({
	customersPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await customersPage.getByLabel("検索キーワード").fill("存在しない顧客");
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			customersPage.getByText("顧客が見つかりませんでした"),
		).toBeVisible();
	});
});

test("ページネーションが正しく動作する", async ({ customersPage }) => {
	await test.step("1ページ目に20件表示されることを確認", async () => {
		// seedデータは25件なので、1ページ目に20件表示される
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});

	await test.step("ページネーションリンクをクリック", async () => {
		await customersPage.getByRole("link", { name: "2" }).click();
		await customersPage.waitForURL("**/customers?page=2");
	});

	await test.step("2ページ目に残りのデータが表示されることを確認", async () => {
		// seedデータは25件なので、2ページ目に5件表示される
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(5);
	});

	await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
		await customersPage.getByRole("link", { name: "前へ" }).click();
		await customersPage.waitForURL("/customers?page=1");
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});
});

test("検索とページネーションを組み合わせて使用できる", async ({
	customersPage,
}) => {
	const searchKeyword = "example.com";

	await test.step("検索を実行", async () => {
		// seedデータには複数の「example.com」のメールアドレスがある（25件）
		await customersPage.getByLabel("検索キーワード").fill(searchKeyword);
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("1ページ目の検索結果を確認", async () => {
		// Skeletonではなく実際のデータが表示されるまで待つ
		// (Skeletonは5行、実データは20行なので行数で判定)
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(20);

		// 表示されている全てのデータが検索キーワードを含んでいることを確認
		const count = await rows.count();
		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});

	await test.step("検索結果の2ページ目に遷移", async () => {
		await customersPage.getByRole("link", { name: "2" }).click();
		await customersPage.waitForURL("**/customers?keyword=*&page=2");
	});

	await test.step("2ページ目の検索結果を確認", async () => {
		// Skeletonではなく実際のデータが表示されるまで待つ
		// (2ページ目は5行)
		const rows = customersPage.locator("table tbody tr");
		await expect(rows).toHaveCount(5);

		// 表示されている全てのデータが検索キーワードを含んでいることを確認
		const count = await rows.count();
		for (let i = 0; i < count; i++) {
			const row = rows.nth(i);
			const text = await row.textContent();
			expect(text).toContain(searchKeyword);
		}
	});

	await test.step("検索キーワードが保持されていることを確認", async () => {
		const searchInput = customersPage.getByLabel("検索キーワード");
		await expect(searchInput).toHaveValue(searchKeyword);
	});
});

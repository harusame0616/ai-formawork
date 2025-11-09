import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { test as base, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Supabase ローカル開発環境の設定
const SUPABASE_URL = "http://127.0.0.1:62021";
const SUPABASE_SERVICE_ROLE_KEY /* cspell:disable-next-line */ =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

type CustomersPageFixture = {
	customersPage: Page;
	testUser: {
		email: string;
		password: string;
	};
};

const test = base.extend<CustomersPageFixture>({
	testUser: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const testUser = {
			email: "customer-test@example.com",
			password: "Test@Pass123",
		};

		// テストユーザーを作成
		const { data: createdUser, error } = await supabase.auth.admin.createUser({
			email: testUser.email,
			email_confirm: true,
			password: testUser.password,
		});

		if (error) {
			throw error;
		}

		await use(testUser);

		// クリーンアップ
		if (createdUser?.user?.id) {
			await supabase.auth.admin.deleteUser(createdUser.user.id);
		}
	},

	customersPage: async ({ page, testUser }, use) => {
		// テスト用の顧客データを作成
		await db.insert(customersTable).values([
			{
				email: "customer1@example.com",
				name: "テスト太郎",
				phone: "090-1234-5678",
			},
			{
				email: "customer2@example.com",
				name: "山田花子",
				phone: "080-9876-5432",
			},
			{
				email: "customer3@example.com",
				name: "佐藤次郎",
				phone: null,
			},
			{
				email: "admin@example.com",
				name: "管理者",
				phone: "070-1111-2222",
			},
		]);

		// ログイン処理
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page.getByRole("textbox", { name: "パスワード" }).fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		// 顧客一覧ページに遷移
		await page.goto("/customers");
		await page.waitForURL("/customers");

		await use(page);

		// テストデータをクリーンアップ
		await db.delete(customersTable);
	},
});

test("顧客一覧ページが正しく表示される", async ({ customersPage }) => {
	await test.step("顧客一覧が表示されることを確認", async () => {
		await expect(customersPage.getByRole("heading", { name: "顧客一覧" })).toBeVisible();
		await expect(customersPage.getByText("テスト太郎")).toBeVisible();
		await expect(customersPage.getByText("山田花子")).toBeVisible();
		await expect(customersPage.getByText("佐藤次郎")).toBeVisible();
		await expect(customersPage.getByText("管理者")).toBeVisible();
	});

	await test.step("検索フォームが表示されることを確認", async () => {
		await expect(
			customersPage.getByPlaceholder("名前、メールアドレス、電話番号で検索"),
		).toBeVisible();
		await expect(customersPage.getByRole("button", { name: "検索" })).toBeVisible();
	});
});

test("名前で検索できる", async ({ customersPage }) => {
	await test.step("検索キーワードを入力", async () => {
		await customersPage
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("太郎");
	});

	await test.step("検索ボタンをクリック", async () => {
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		await expect(customersPage.getByText("テスト太郎")).toBeVisible();
		await expect(customersPage.getByText("山田花子")).not.toBeVisible();
		await expect(customersPage.getByText("佐藤次郎")).not.toBeVisible();
	});
});

test("メールアドレスで検索できる", async ({ customersPage }) => {
	await test.step("メールアドレスで検索", async () => {
		await customersPage
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("admin");
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		await expect(customersPage.getByText("管理者")).toBeVisible();
		await expect(customersPage.getByText("テスト太郎")).not.toBeVisible();
	});
});

test("電話番号で検索できる", async ({ customersPage }) => {
	await test.step("電話番号で検索", async () => {
		await customersPage
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("080-9876");
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果を確認", async () => {
		await expect(customersPage.getByText("山田花子")).toBeVisible();
		await expect(customersPage.getByText("テスト太郎")).not.toBeVisible();
	});
});

test("該当する顧客がいない場合、メッセージが表示される", async ({
	customersPage,
}) => {
	await test.step("存在しないキーワードで検索", async () => {
		await customersPage
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("存在しない顧客");
		await customersPage.getByRole("button", { name: "検索" }).click();
		await customersPage.waitForURL("**/customers?keyword=*");
	});

	await test.step("メッセージを確認", async () => {
		await expect(
			customersPage.getByText("顧客が見つかりませんでした"),
		).toBeVisible();
	});
});

test("ページネーションが正しく動作する", async ({ page, testUser }) => {
	// 大量のデータを作成（21件以上）
	const manyCustomers = Array.from({ length: 25 }, (_, i) => ({
		email: `test${i}@example.com`,
		name: `テストユーザー${i}`,
		phone: `090-0000-${String(i).padStart(4, "0")}`,
	}));
	await db.insert(customersTable).values(manyCustomers);

	// ログインして顧客一覧ページに遷移
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill(testUser.email);
	await page.getByRole("textbox", { name: "パスワード" }).fill(testUser.password);
	await page.getByRole("button", { name: "ログイン" }).click();
	await page.waitForURL("/");
	await page.goto("/customers");

	await test.step("1ページ目に20件表示されることを確認", async () => {
		// 正確に20件表示されているか確認
		const rows = page.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});

	await test.step("ページネーションリンクをクリック", async () => {
		await page.getByRole("link", { name: "2" }).click();
		await page.waitForURL("**/customers?page=2");
	});

	await test.step("2ページ目に残りのデータが表示されることを確認", async () => {
		const rows = page.locator("table tbody tr");
		await expect(rows).toHaveCount(5);
	});

	await test.step("「前へ」ボタンで1ページ目に戻れることを確認", async () => {
		await page.getByRole("link", { name: "前へ" }).click();
		await page.waitForURL("/customers?page=1");
		const rows = page.locator("table tbody tr");
		await expect(rows).toHaveCount(20);
	});

	// クリーンアップ
	await db.delete(customersTable);
});

test("検索とページネーションを組み合わせて使用できる", async ({
	page,
	testUser,
}) => {
	// 検索可能なデータを大量に作成
	const manyCustomers = Array.from({ length: 25 }, (_, i) => ({
		email: `search${i}@example.com`,
		name: `検索対象${i}`,
		phone: `090-0000-${String(i).padStart(4, "0")}`,
	}));
	await db.insert(customersTable).values(manyCustomers);

	// ログインして顧客一覧ページに遷移
	await page.goto("/login");
	await page.getByLabel("メールアドレス").fill(testUser.email);
	await page.getByRole("textbox", { name: "パスワード" }).fill(testUser.password);
	await page.getByRole("button", { name: "ログイン" }).click();
	await page.waitForURL("/");
	await page.goto("/customers");

	await test.step("検索を実行", async () => {
		await page
			.getByPlaceholder("名前、メールアドレス、電話番号で検索")
			.fill("検索対象");
		await page.getByRole("button", { name: "検索" }).click();
		await page.waitForURL("**/customers?keyword=*");
	});

	await test.step("検索結果の2ページ目に遷移", async () => {
		await page.getByRole("link", { name: "2" }).click();
		await page.waitForURL("**/customers?keyword=*&page=2");
	});

	await test.step("検索キーワードが保持されていることを確認", async () => {
		const searchInput = page.getByPlaceholder(
			"名前、メールアドレス、電話番号で検索",
		);
		await expect(searchInput).toHaveValue("検索対象");
	});

	// クリーンアップ
	await db.delete(customersTable);
});

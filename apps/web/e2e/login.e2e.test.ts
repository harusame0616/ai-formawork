import { test as base, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Supabase ローカル開発環境の設定 (packages/supabase/config.toml参照)
const SUPABASE_URL = "http://127.0.0.1:62021";
const SUPABASE_SERVICE_ROLE_KEY /* cspell:disable-next-line */ =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

type TestUser = {
	email: string;
	password: string;
};

type LoginPageFixture = {
	loginPage: Page;
	boundaryEmailUser: TestUser;
	boundaryPasswordUser: TestUser;
};

const test = base.extend<LoginPageFixture>({
	boundaryEmailUser: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		// 254文字のメールアドレス (242 + 1(@) + 11(example.com) = 254文字)
		// ランダムな文字列を生成してユニークなメールアドレスを作成
		const randomString = Math.random().toString(36).substring(2, 15);
		const padding = "a".repeat(242 - randomString.length);
		const testUser: TestUser = {
			email: `${randomString}${padding}@example.com`,
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

		// クリーンアップ（作成時のユーザーIDを使用して削除）
		if (createdUser?.user?.id) {
			await supabase.auth.admin.deleteUser(createdUser.user.id);
		}
	},

	boundaryPasswordUser: async (
		// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		// 64文字のパスワードでユーザーを作成し、実際にログインできることをテストする
		const randomString = Math.random().toString(36).substring(2, 15);
		const testUser: TestUser = {
			email: `boundary-password-${randomString}@example.com`,
			password: "a".repeat(64),
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

		// クリーンアップ（作成時のユーザーIDを使用して削除）
		if (createdUser?.user?.id) {
			await supabase.auth.admin.deleteUser(createdUser.user.id);
		}
	},
	loginPage: async ({ page }, use) => {
		await page.goto("/login");
		await page.waitForURL("/login");
		await use(page);
	},
});

test("正しいメールアドレスとパスワードを入力するとホームにリダイレクトされ、バックしてもログインページに戻らない", async ({
	loginPage,
}) => {
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

test("正しくないメールアドレスとパスワードを入力するとエラーメッセージが表示される。", async ({
	loginPage,
}) => {
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
		await expect(loginPage.getByRole("main").getByRole("alert")).toBeVisible();
	});
});

test("最大文字数のメールアドレス（254文字）でログインできる", async ({
	loginPage,
	boundaryEmailUser,
}) => {
	await test.step("254文字のメールアドレスと有効なパスワードを入力", async () => {
		await loginPage.getByLabel("メールアドレス").fill(boundaryEmailUser.email);
		await loginPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(boundaryEmailUser.password);
	});

	await test.step("ログインボタンをクリック", async () => {
		await loginPage.getByRole("button", { name: "ログイン" }).click();
	});

	await test.step("ホームページにリダイレクトされることを確認", async () => {
		await expect(loginPage).toHaveURL("/");
	});
});

test("最大文字数のパスワード（64文字）のパスワードでログインできる", async ({
	loginPage,
	boundaryPasswordUser,
}) => {
	await test.step("有効なメールアドレスと64文字のパスワードを入力", async () => {
		await loginPage
			.getByLabel("メールアドレス")
			.fill(boundaryPasswordUser.email);
		await loginPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(boundaryPasswordUser.password);
	});

	await test.step("ログインボタンをクリック", async () => {
		await loginPage.getByRole("button", { name: "ログイン" }).click();
	});

	await test.step("ホームページにリダイレクトされることを確認", async () => {
		await expect(loginPage).toHaveURL("/");
	});
});

import { test as base, expect, type Page } from "@playwright/test";
import { v4 } from "uuid";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";

// シードデータに登録されている管理者スタッフID（削除用）
const ADMIN_STAFF_ID = "00000000-0000-0000-0000-000000000003";

type PasswordChangeFixture = {
	homePage: Page;
	passwordChangePage: Page;
	testUser: {
		email: string;
		password: string;
		staffId: string;
	};
};

const test = base.extend<PasswordChangeFixture>({
	async homePage({ page, testUser }, use) {
		// ログインページにアクセス
		await page.goto("/login");
		await page.waitForURL("/login");

		// ログイン
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();

		// ホームにリダイレクトされるまで待機
		await page.waitForURL("/");

		await use(page);
	},
	async passwordChangePage({ homePage: loggedInPage }, use) {
		// パスワード変更ページに直接アクセス
		await loggedInPage.goto("/settings/password");
		await loggedInPage.waitForURL("/settings/password");

		await use(loggedInPage);
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testUser({}, use) {
		const uniqueId = v4().slice(0, 8);
		const userData = {
			email: `password-change-test-${uniqueId}@example.com`,
			firstName: "パスワード変更",
			lastName: `テスト${uniqueId}`,
			password: "Test@Pass123",
			role: "user" as const,
		};

		const result = await registerStaff(userData);
		if (!result.success) {
			throw new Error(`テストユーザーの登録に失敗: ${result.error}`);
		}

		await use({
			email: userData.email,
			password: userData.password,
			staffId: result.data.staffId,
		});

		// クリーンアップ: スタッフを削除
		await deleteStaff({
			currentUserStaffId: ADMIN_STAFF_ID,
			staffId: result.data.staffId,
		});
	},
});

test("ユーザーメニューからパスワード変更ページにアクセスできる", async ({
	homePage,
}) => {
	await test.step("ユーザーメニューを開く", async () => {
		await homePage
			.getByRole("button", { name: "ユーザーメニューを開く" })
			.click();
	});

	await test.step("パスワード変更リンクをクリック", async () => {
		await homePage.getByRole("menuitem", { name: "パスワード変更" }).click();
	});

	await test.step("パスワード変更ページに遷移", async () => {
		await expect(homePage).toHaveURL("/settings/password");
		await expect(
			homePage.getByRole("heading", { name: "パスワード変更" }),
		).toBeVisible();
	});
});

test("正しい現在のパスワードと新しいパスワードでパスワードを変更できる", async ({
	passwordChangePage,
	testUser,
}) => {
	const newPassword = "NewPass@456";

	await test.step("現在のパスワードと新しいパスワードを入力", async () => {
		await passwordChangePage
			.getByLabel("現在のパスワード")
			.fill(testUser.password);
		await passwordChangePage.getByLabel("新しいパスワード").fill(newPassword);
	});

	await test.step("パスワードを変更ボタンをクリック", async () => {
		await passwordChangePage
			.getByRole("button", { name: "パスワードを変更" })
			.click();
	});

	await test.step("ホームページにリダイレクトされる", async () => {
		await expect(passwordChangePage).toHaveURL("/");
	});

	await test.step("新しいパスワードでログインできることを確認", async () => {
		// ログアウト後、新しいパスワードでログインを試行
		await passwordChangePage.goto("/login");

		await passwordChangePage.getByLabel("メールアドレス").fill(testUser.email);
		await passwordChangePage
			.getByRole("textbox", { name: "パスワード" })
			.fill(newPassword);
		await passwordChangePage.getByRole("button", { name: "ログイン" }).click();

		await expect(passwordChangePage).toHaveURL("/");
	});
});

test("現在のパスワードが間違っている場合、エラーメッセージが表示される", async ({
	passwordChangePage,
}) => {
	await test.step("間違った現在のパスワードと新しいパスワードを入力", async () => {
		await passwordChangePage
			.getByLabel("現在のパスワード")
			.fill("Wrong@Pass123");
		await passwordChangePage.getByLabel("新しいパスワード").fill("New@Pass456");
	});

	await test.step("パスワードを変更ボタンをクリック", async () => {
		await passwordChangePage
			.getByRole("button", { name: "パスワードを変更" })
			.click();
	});

	await test.step("エラーメッセージが表示される", async () => {
		await expect(passwordChangePage.getByRole("alert")).toBeVisible();
		await expect(
			passwordChangePage.getByText("現在のパスワードが正しくありません"),
		).toBeVisible();
	});
});

test("キャンセルボタンをクリックすると前のページに戻る", async ({
	homePage: loggedInPage,
}) => {
	await test.step("ユーザーメニューからパスワード変更ページにアクセス", async () => {
		// ユーザーメニューから遷移（履歴を作成）
		await loggedInPage
			.getByRole("button", { name: "ユーザーメニューを開く" })
			.click();
		await loggedInPage
			.getByRole("menuitem", { name: "パスワード変更" })
			.click();
		await expect(loggedInPage).toHaveURL("/settings/password");
	});

	await test.step("キャンセルボタンをクリック", async () => {
		await loggedInPage.getByRole("button", { name: "キャンセル" }).click();
	});

	await test.step("前のページ（ホーム）に戻る", async () => {
		await expect(loggedInPage).toHaveURL("/");
	});
});

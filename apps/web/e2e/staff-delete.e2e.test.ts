import { test as base, expect, type Page } from "@playwright/test";
import { v4 } from "uuid";

type Fixtures = {
	adminUserPage: Page;
	normalUserPage: Page;
	testStaff: {
		email: string;
		name: string;
		password: string;
	};
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

	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async testStaff({}, use) {
		const testStaff = {
			email: `test-staff-${v4()}@example.com`,
			name: `テスト削除用スタッフ ${v4().slice(0, 8)}`,
			password: "TestStaff@123",
		};
		await use(testStaff);
	},
});

test("管理者がスタッフを削除できる", async ({
	adminUserPage: page,
	testStaff,
}) => {
	let staffId: string;

	await test.step("テスト用スタッフを登録", async () => {
		await page.goto("/staffs/new");
		await page.waitForURL("/staffs/new");

		await page.getByLabel("名前").fill(testStaff.name);
		await page.getByLabel("メールアドレス").fill(testStaff.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testStaff.password);
		await page.getByRole("radio", { name: "一般" }).click();

		await page.getByRole("button", { name: "登録" }).click();

		await page.waitForURL("/staffs");
	});

	await test.step("スタッフ詳細ページに遷移", async () => {
		await page.getByLabel("検索キーワード").fill(testStaff.name);
		await page.getByRole("button", { name: "検索" }).click();

		const staffLink = page.getByRole("link", { name: testStaff.name });
		await expect(staffLink).toBeVisible();

		const href = await staffLink.getAttribute("href");
		staffId = href?.replace("/staffs/", "") ?? "";

		await staffLink.click();
		await page.waitForURL(`/staffs/${staffId}`);
	});

	await test.step("削除実行", async () => {
		await page.getByRole("button", { name: "削除" }).click();
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "削除" })
			.click();
		await page.waitForURL("/staffs");
	});

	await test.step("削除されたスタッフを検索してもヒットしないことを確認", async () => {
		await page.getByLabel("検索キーワード").fill(testStaff.name);
		await page.getByRole("button", { name: "検索" }).click();

		await expect(
			page.getByText("スタッフが見つかりませんでした"),
		).toBeVisible();
	});
});

test("一般ユーザーにはスタッフ削除ボタンが表示されない", async ({
	normalUserPage: page,
}) => {
	await test.step("スタッフ詳細ページに遷移", async () => {
		await page.goto("/staffs/00000000-0000-0000-0000-000000000001");
		await page.waitForURL("/staffs/00000000-0000-0000-0000-000000000001");
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByText("田中 太郎")).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

test("管理者でも自分自身の詳細ページでは削除ボタンが表示されない", async ({
	adminUserPage: page,
}) => {
	await test.step("スタッフ一覧ページに遷移", async () => {
		await page.goto("/staffs");
		await page.waitForURL("/staffs");
	});

	await test.step("管理者のメールアドレスで検索", async () => {
		await page.getByLabel("検索キーワード").fill("admin@example.com");
		await page.getByRole("button", { name: "検索" }).click();
	});

	await test.step("自分自身の詳細ページに遷移", async () => {
		const adminLink = page.getByRole("link", { name: /Admin/i }).first();
		await adminLink.click();
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

import { test as base, expect, type Page } from "@playwright/test";
import { v4 } from "uuid";
import { registerStaff } from "@/features/staff/register/register-staff";

type Fixtures = {
	adminUserPage: Page;
	normalUserPage: Page;
	testStaff: {
		email: string;
		firstName: string;
		lastName: string;
		staffId: string;
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

	// biome-ignore lint/correctness/noEmptyPattern: Playwrightのfixtureパターンで使用する標準的な記法
	async testStaff({}, use) {
		const uniqueId = v4().slice(0, 8);
		const staffData = {
			email: `test-staff-${v4()}@example.com`,
			firstName: `削除用${uniqueId}`,
			lastName: `テスト${uniqueId}`,
			password: "TestStaff@123",
			role: "user" as const,
		};

		const result = await registerStaff(staffData);
		if (!result.success) {
			throw new Error(`テストスタッフの登録に失敗: ${result.error}`);
		}

		await use({
			email: staffData.email,
			firstName: staffData.firstName,
			lastName: staffData.lastName,
			staffId: result.data.staffId,
		});
	},
});

test("管理者がスタッフを削除できる", async ({
	adminUserPage: page,
	testStaff,
}) => {
	await test.step("スタッフ詳細ページに遷移", async () => {
		await page.goto(`/staffs/${testStaff.staffId}`);
		await page.waitForURL(`/staffs/${testStaff.staffId}`);
		await expect(
			page.getByText(`${testStaff.lastName} ${testStaff.firstName}`),
		).toBeVisible();
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
		await page.getByLabel("キーワード").fill(testStaff.lastName);
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
	await test.step("自分自身の詳細ページに遷移", async () => {
		await page.goto("/staffs/00000000-0000-0000-0000-000000000003");
		await page.waitForURL("/staffs/00000000-0000-0000-0000-000000000003");
	});

	await test.step("削除ボタンが表示されないことを確認", async () => {
		await expect(page.getByText("佐藤 次郎")).toBeVisible();
		await expect(page.getByRole("button", { name: "削除" })).toBeHidden();
	});
});

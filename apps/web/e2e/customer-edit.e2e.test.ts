import { test as base, expect, type Page } from "@playwright/test";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";

type Fixtures = {
	customer: {
		customerId: string;
		email: string;
		name: string;
		phone: string;
	};
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

		await use(page);
	},

	// biome-ignore lint/correctness/noEmptyPattern: The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "_".
	async customer({}, use) {
		const customer = {
			customerId: v4(),
			email: `${v4()}@example.com`,
			name: v4().slice(0, 24),
			phone: `${Math.floor(Math.random() * 1000000000)}`,
		};

		await db.insert(customersTable).values(customer);
		await use(customer);
		await db
			.delete(customersTable)
			.where(eq(customersTable.customerId, customer.customerId));
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

test("管理者が必須フィールドを全て入力して編集できる", async ({
	adminUserPage: page,
	customer,
}) => {
	await test.step("顧客編集ページへ遷移", async () => {
		await page.goto(`/customers/${customer.customerId}/edit`);
		await page.waitForURL(`/customers/${customer.customerId}/edit`);
		await expect(page.getByText("読み込み中")).toBeHidden();
	});

	const newCustomer = {
		email: `${v4()}@example.com`,
		name: v4().slice(0, 24),
		phone: `${Math.floor(Math.random() * 1000000000)}`,
	};
	await test.step("顧客情報を編集", async () => {
		await page.getByLabel("名前").clear();
		await page.getByLabel("名前").fill(newCustomer.name);

		await page.getByLabel("メールアドレス").clear();
		await page.getByLabel("メールアドレス").fill(newCustomer.email);

		await page.getByLabel("電話番号").clear();
		await page.getByLabel("電話番号").fill(newCustomer.phone);

		await page.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("顧客詳細ページにリダイレクトされる", async () => {
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("編集内容が反映されていることを確認", async () => {
		await expect(
			page.getByRole("heading", { name: newCustomer.name }),
		).toBeVisible();
		await expect(page.getByText(newCustomer.email)).toBeVisible();
		await expect(page.getByText(newCustomer.phone)).toBeVisible();
	});
});

test("管理者が必須フィールド以外を空で編集できる", async ({
	adminUserPage: page,
	customer,
}) => {
	await test.step("編集ページへ遷移", async () => {
		await page.goto(`/customers/${customer.customerId}/edit`);
		await page.waitForURL(`/customers/${customer.customerId}/edit`);
		await expect(page.getByText("読み込み中")).toBeHidden();
	});

	await test.step("メールアドレスと電話番号をクリア", async () => {
		await page.getByLabel("メールアドレス").clear();
		await page.getByLabel("電話番号").clear();
	});

	await test.step("更新ボタンをクリック", async () => {
		await page.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("顧客詳細ページにリダイレクトされる", async () => {
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("メールアドレスと電話番号が「未登録」と表示されることを確認", async () => {
		await expect(
			page.locator('text="メールアドレス"').locator("..").getByText("未登録"),
		).toBeVisible();
		await expect(
			page.locator('text="電話番号"').locator("..").getByText("未登録"),
		).toBeVisible();
	});
});

test("一般ユーザーには顧客詳細ページで編集リンクが表示されない", async ({
	normalUserPage: page,
	customer,
}) => {
	await test.step("顧客詳細ページに遷移", async () => {
		await page.goto(`/customers/${customer.customerId}`);
		await page.waitForURL(`/customers/${customer.customerId}`);
	});

	await test.step("編集リンクが表示されないことを確認", async () => {
		await expect(page.getByRole("link", { name: "編集" })).toBeHidden();
	});
});

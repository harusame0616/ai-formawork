import { expect, test } from "@playwright/test";

test("顧客情報を編集できる", async ({ page }) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};

	await test.step("ログイン", async () => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
	});

	await test.step("顧客詳細ページへ遷移", async () => {
		await page.goto(`/customers/${customerId}/basic`);
		await page.waitForURL(`/customers/${customerId}/basic`);
		await expect(page.getByText("読み込み中")).toBeHidden();
	});

	await test.step("編集リンクをクリック", async () => {
		await page.getByRole("link", { name: "編集" }).click();
		await page.waitForURL(`/customers/${customerId}/edit`);
	});

	await test.step("顧客情報を編集", async () => {
		// フォームが表示されることを確認
		await expect(page.getByLabel("顧客名")).toBeVisible();

		await page.getByLabel("顧客名").fill("編集太郎");
		await page.getByLabel("メールアドレス").fill("edited@example.com");
		await page.getByLabel("電話番号").fill("090-0000-0000");

		await page.getByRole("button", { name: "編集する" }).click();
	});

	await test.step("顧客詳細ページにリダイレクトされる", async () => {
		await page.waitForURL(`/customers/${customerId}/basic`);
	});

	await test.step("編集内容が反映されていることを確認", async () => {
		// ページタイトルに編集後の名前が表示されることを確認
		await expect(page.getByRole("heading", { name: "編集太郎" })).toBeVisible();

		// 編集後のメールアドレスと電話番号が表示されることを確認
		await expect(page.getByText("edited@example.com")).toBeVisible();
		await expect(page.getByText("090-0000-0000")).toBeVisible();
	});
});

test("メールアドレスと電話番号を空にできる", async ({ page }) => {
	const customerId = "00000000-0000-0000-0000-000000000003";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};

	await test.step("ログイン", async () => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
	});

	await test.step("編集ページへ遷移", async () => {
		await page.goto(`/customers/${customerId}/edit`);
		await page.waitForURL(`/customers/${customerId}/edit`);
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
		await page.waitForURL(`/customers/${customerId}/basic`);
	});

	await test.step("メールアドレスと電話番号が「未登録」と表示されることを確認", async () => {
		// メールアドレスと電話番号のフィールドに「未登録」が表示されることを確認
		const emailField = page.locator('text="メールアドレス"').locator("..");
		await expect(emailField.getByText("未登録")).toBeVisible();

		const phoneField = page.locator('text="電話番号"').locator("..");
		await expect(phoneField.getByText("未登録")).toBeVisible();
	});
});

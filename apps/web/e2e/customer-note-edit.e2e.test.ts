import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("作成した本人が編集できる", async ({ page }) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};
	const noteContent = `編集テスト用ノート (${randomUUID()})`;
	const editedContent = `編集後のノート (${randomUUID()})`;

	await test.step("ログイン", async () => {
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");
	});

	await test.step("顧客ノート一覧ページへ遷移", async () => {
		await page.goto(`/customers/${customerId}/notes`);
		await page.waitForURL(`/customers/${customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();
	});

	await test.step("ノート作成", async () => {
		await page.getByRole("button", { name: "ノートを追加" }).click();
		await expect(
			page.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();

		await page.getByLabel("内容").fill(noteContent);

		await page
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// ダイアログが閉じることを確認
		await expect(page.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(page.getByText(noteContent)).toBeVisible();
	});

	await test.step("編集ボタンをクリック", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(noteContent),
		});

		await noteCard.getByRole("button", { name: "編集" }).click();

		// 編集ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを編集" }),
		).toBeVisible();

		// 既存の内容が入力されていることを確認
		await expect(dialog.getByLabel("内容")).toHaveValue(noteContent);
	});

	await test.step("内容を編集して更新", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByLabel("内容").fill(editedContent);
		await dialog.getByRole("button", { name: "更新" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("編集内容が反映されることを確認", async () => {
		// 編集後の内容が一覧に表示されることを確認
		await expect(page.getByText(editedContent)).toBeVisible();

		// 元の内容が表示されないことを確認
		await expect(page.getByText(noteContent)).toBeHidden();
	});
});

test("管理者が他人のノートを編集できる", async ({ browser }) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};
	const adminUser = {
		email: "admin@example.com",
		password: "Admin@789!",
	};
	const noteContent = `管理者編集テスト用ノート (${randomUUID()})`;
	const editedContent = `管理者が編集したノート (${randomUUID()})`;

	// test1 ユーザーでノート作成
	const userContext = await browser.newContext();
	const userPage = await userContext.newPage();

	await test.step("test1 でログイン", async () => {
		await userPage.goto("/login");
		await userPage.getByLabel("メールアドレス").fill(testUser.email);
		await userPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await userPage.getByRole("button", { name: "ログイン" }).click();
		await userPage.waitForURL("/");
	});

	await test.step("test1 で顧客ノート一覧ページへ遷移", async () => {
		await userPage.goto(`/customers/${customerId}/notes`);
		await userPage.waitForURL(`/customers/${customerId}/notes`);
		await expect(userPage.getByText("読み込み中")).toBeHidden();
	});

	await test.step("test1 でノート作成", async () => {
		await userPage.getByRole("button", { name: "ノートを追加" }).click();
		await expect(
			userPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();

		await userPage.getByLabel("内容").fill(noteContent);

		await userPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// ダイアログが閉じることを確認
		await expect(userPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(userPage.getByText(noteContent)).toBeVisible();
	});

	await userContext.close();

	// admin ユーザーで編集
	const adminContext = await browser.newContext();
	const adminPage = await adminContext.newPage();

	await test.step("admin でログイン", async () => {
		await adminPage.goto("/login");
		await adminPage.getByLabel("メールアドレス").fill(adminUser.email);
		await adminPage
			.getByRole("textbox", { name: "パスワード" })
			.fill(adminUser.password);
		await adminPage.getByRole("button", { name: "ログイン" }).click();
		await adminPage.waitForURL("/");
	});

	await test.step("admin で顧客ノート一覧ページへ遷移", async () => {
		await adminPage.goto(`/customers/${customerId}/notes`);
		await adminPage.waitForURL(`/customers/${customerId}/notes`);
		await expect(adminPage.getByText("読み込み中")).toBeHidden();
	});

	await test.step("admin で test1 が作成したノートを編集", async () => {
		const noteCard = adminPage.getByRole("listitem").filter({
			has: adminPage.getByText(noteContent),
		});

		// 編集ボタンが表示されることを確認
		const editButton = noteCard.getByRole("button", { name: "編集" });
		await expect(editButton).toBeVisible();

		await editButton.click();

		// 編集ダイアログが表示されることを確認
		const dialog = adminPage.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを編集" }),
		).toBeVisible();

		// 内容を編集
		await dialog.getByLabel("内容").fill(editedContent);
		await dialog.getByRole("button", { name: "更新" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("編集内容が反映されることを確認", async () => {
		// 編集後の内容が一覧に表示されることを確認
		await expect(adminPage.getByText(editedContent)).toBeVisible();

		// 元の内容が表示されないことを確認
		await expect(adminPage.getByText(noteContent)).toBeHidden();
	});

	await adminContext.close();
});

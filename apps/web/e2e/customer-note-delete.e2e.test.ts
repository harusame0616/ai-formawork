import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("作成した本人が削除できる", async ({ page }) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};
	const noteContent = `削除テスト用ノート (${randomUUID()})`;

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

	await test.step("削除ボタンをクリック", async () => {
		const noteCard = page.getByRole("listitem").filter({
			has: page.getByText(noteContent),
		});

		await noteCard.getByRole("button", { name: "削除" }).click();

		// 削除確認ダイアログが表示されることを確認
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを削除" }),
		).toBeVisible();
		await expect(
			dialog.getByText(
				"このノートを削除してもよろしいですか？この操作は取り消せません。",
			),
		).toBeVisible();
	});

	await test.step("確認ダイアログでOKをクリック", async () => {
		const dialog = page.getByRole("dialog");
		await dialog.getByRole("button", { name: "削除" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("ノートが削除されることを確認", async () => {
		// 削除したノートが一覧に表示されないことを確認
		await expect(page.getByText(noteContent)).toBeHidden();
	});
});

test("管理者が他人のノートを削除できる", async ({ browser }) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};
	const adminUser = {
		email: "admin@example.com",
		password: "Admin@789!",
	};
	const noteContent = `管理者削除テスト用ノート (${randomUUID()})`;

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

	// admin ユーザーで削除
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

	await test.step("admin で test1 が作成したノートを削除", async () => {
		const noteCard = adminPage.getByRole("listitem").filter({
			has: adminPage.getByText(noteContent),
		});

		// 削除ボタンが表示されることを確認
		const deleteButton = noteCard.getByRole("button", { name: "削除" });
		await expect(deleteButton).toBeVisible();

		await deleteButton.click();

		// 削除確認ダイアログが表示されることを確認
		const dialog = adminPage.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "ノートを削除" }),
		).toBeVisible();

		// 削除実行
		await dialog.getByRole("button", { name: "削除" }).click();

		// ダイアログが閉じることを確認
		await expect(dialog).toBeHidden();
	});

	await test.step("ノートが削除されることを確認", async () => {
		// 削除したノートが一覧に表示されないことを確認
		await expect(adminPage.getByText(noteContent)).toBeHidden();
	});

	await adminContext.close();
});

test("管理者じゃない別ユーザーには削除ボタンが表示されない", async ({
	browser,
}) => {
	const customerId = "00000000-0000-0000-0000-000000000001";
	const testUser1 = {
		email: "test1@example.com",
		password: "Test@Pass123",
	};
	const testUser2 = {
		email: "test2@example.com",
		password: "Secure@456",
	};
	const noteContent = `別ユーザー削除不可テスト用ノート (${randomUUID()})`;

	// test1 ユーザーでノート作成
	const user1Context = await browser.newContext();
	const user1Page = await user1Context.newPage();

	await test.step("test1 でログイン", async () => {
		await user1Page.goto("/login");
		await user1Page.getByLabel("メールアドレス").fill(testUser1.email);
		await user1Page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser1.password);
		await user1Page.getByRole("button", { name: "ログイン" }).click();
		await user1Page.waitForURL("/");
	});

	await test.step("test1 で顧客ノート一覧ページへ遷移", async () => {
		await user1Page.goto(`/customers/${customerId}/notes`);
		await user1Page.waitForURL(`/customers/${customerId}/notes`);
		await expect(user1Page.getByText("読み込み中")).toBeHidden();
	});

	await test.step("test1 でノート作成", async () => {
		await user1Page.getByRole("button", { name: "ノートを追加" }).click();
		await expect(
			user1Page.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();

		await user1Page.getByLabel("内容").fill(noteContent);

		await user1Page
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// ダイアログが閉じることを確認
		await expect(user1Page.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(user1Page.getByText(noteContent)).toBeVisible();
	});

	await user1Context.close();

	// test2 ユーザーで確認
	const user2Context = await browser.newContext();
	const user2Page = await user2Context.newPage();

	await test.step("test2 でログイン", async () => {
		await user2Page.goto("/login");
		await user2Page.getByLabel("メールアドレス").fill(testUser2.email);
		await user2Page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser2.password);
		await user2Page.getByRole("button", { name: "ログイン" }).click();
		await user2Page.waitForURL("/");
	});

	await test.step("test2 で顧客ノート一覧ページへ遷移", async () => {
		await user2Page.goto(`/customers/${customerId}/notes`);
		await user2Page.waitForURL(`/customers/${customerId}/notes`);
		await expect(user2Page.getByText("読み込み中")).toBeHidden();
	});

	await test.step("test1 が作成したノートに削除ボタンが表示されないことを確認", async () => {
		const noteCard = user2Page.getByRole("listitem").filter({
			has: user2Page.getByText(noteContent),
		});

		// ノートが表示されることを確認
		await expect(noteCard).toBeVisible();

		// 削除ボタンが表示されないことを確認
		await expect(noteCard.getByRole("button", { name: "削除" })).toBeHidden();

		// 編集ボタンも表示されないことを確認
		await expect(noteCard.getByRole("button", { name: "編集" })).toBeHidden();
	});

	await user2Context.close();
});

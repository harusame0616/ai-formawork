import { randomUUID } from "node:crypto";
import path from "node:path";
import { test as base, expect, type Page } from "@playwright/test";

type CustomerNotesPageFixture = {
	customerNotesPage: Page;
};

const test = base.extend<CustomerNotesPageFixture>({
	customerNotesPage: async ({ page }, use) => {
		const customerId = "00000000-0000-0000-0000-000000000001";
		const testUser = {
			email: "test1@example.com",
			password: "Test@Pass123",
		};

		// ログイン
		await page.goto("/login");
		await page.getByLabel("メールアドレス").fill(testUser.email);
		await page
			.getByRole("textbox", { name: "パスワード" })
			.fill(testUser.password);
		await page.getByRole("button", { name: "ログイン" }).click();
		await page.waitForURL("/");

		// 顧客ノート一覧ページへ遷移
		await page.goto(`/customers/${customerId}/notes`);
		await page.waitForURL(`/customers/${customerId}/notes`);
		await expect(page.getByText("読み込み中")).toBeHidden();

		await use(page);
	},
});

test("正常系: 1文字（最小境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	const noteContent = "¥";

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("1文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();
	});

	await test.step("登録結果を確認", async () => {
		// ダイアログが閉じることを確認
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
	});
});

test("正常系: 4096文字（最大境界値）のノート登録成功", async ({
	customerNotesPage,
}) => {
	const noteContent = "あ".repeat(4096);

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("4096文字のノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();
	});

	await test.step("登録結果を確認", async () => {
		// ダイアログが閉じることを確認
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden();

		// 登録したノートが一覧に表示されることを確認
		await expect(customerNotesPage.getByText(noteContent)).toBeVisible();
	});
});

test("正常系: 5枚の画像を含むノート登録成功", async ({ customerNotesPage }) => {
	const noteContent = `画像5枚のテストノート (${randomUUID()})`;
	const imagePaths = [
		path.join(__dirname, "sample1.jpg"),
		path.join(__dirname, "sample2.jpg"),
		path.join(__dirname, "sample3.jpg"),
		path.join(__dirname, "sample4.jpg"),
		path.join(__dirname, "sample5.jpg"),
	];

	await test.step("ノート追加ダイアログを開く", async () => {
		await customerNotesPage
			.getByRole("button", { name: "ノートを追加" })
			.click();
		await expect(
			customerNotesPage.getByRole("dialog").getByText("ノートを追加"),
		).toBeVisible();
	});

	await test.step("5枚の画像を選択", async () => {
		const fileInput = customerNotesPage.locator('input[type="file"]');
		await fileInput.setInputFiles(imagePaths);

		// プレビューが5枚表示されることを確認
		const dialog = customerNotesPage.getByRole("dialog");
		await expect(dialog.locator('img[alt="プレビュー"]')).toHaveCount(5);
	});

	await test.step("ノート内容を入力", async () => {
		await customerNotesPage.getByLabel("内容").fill(noteContent);
	});

	await test.step("ノートを登録", async () => {
		await customerNotesPage
			.getByRole("dialog")
			.getByRole("button", { name: "登録" })
			.click();

		// アップロード完了まで待機（最大30秒）
		await expect(customerNotesPage.getByRole("dialog")).toBeHidden({
			timeout: 30000,
		});
	});

	await test.step("登録結果を確認", async () => {
		// 登録したノートが表示されることを確認
		// 画像が5枚表示されていることを確認
		const noteCard = customerNotesPage.getByRole("listitem").filter({
			has: customerNotesPage.getByText(noteContent),
		});

		const images = noteCard.getByRole("img", {
			name: /^添付画像サムネイル-/,
		});

		// 画像が表示されるまで待機
		await expect(images).toHaveCount(5);

		// TODO: 読み込みが成功していることのテスト
	});

	await test.step("画像ギャラリーを開いて5枚の画像を確認", async () => {
		const noteCard = customerNotesPage.getByRole("listitem").filter({
			has: customerNotesPage.getByText(noteContent),
		});

		// 最初のサムネイルをクリックしてギャラリーを開く
		const firstThumbnail = noteCard.getByRole("img", {
			name: "添付画像サムネイル-1",
		});
		await firstThumbnail.click();

		// Drawerが開いたことを確認
		const drawer = customerNotesPage.getByRole("dialog");
		await expect(drawer).toBeVisible();

		// 画像番号が表示されることを確認（1/5から開始）
		await expect(drawer.getByText("1 / 5")).toBeVisible();

		// 1枚目の画像がビューポートに表示されていることを確認
		const firstImage = drawer.getByRole("img", { name: "添付-1" });
		await expect(firstImage).toBeInViewport();

		// 次のボタンで5枚すべての画像を確認
		const nextButton = drawer.getByRole("button", { name: "次のスライド" });

		for (let i = 2; i <= 5; i++) {
			await nextButton.click();

			await expect(drawer.getByText(`${i} / 5`)).toBeVisible();
			// 前の画像が表示されていないことを確認
			await expect(
				drawer.getByRole("img", { name: `添付-${i - 1}` }),
			).not.toBeInViewport();
			await expect(
				drawer.getByRole("img", { name: `添付-${i}` }),
			).toBeInViewport();
		}

		// 前のボタンで戻れることを確認
		const prevButton = drawer.getByRole("button", {
			name: "前のスライド",
		});
		await prevButton.click();
		await expect(drawer.getByText("4 / 5")).toBeVisible();

		// 戻った画像がビューポートに表示されていることを確認
		expect(drawer.getByRole("img", { name: "添付-5" })).not.toBeInViewport();
		await expect(drawer.getByRole("img", { name: "添付-4" })).toBeInViewport();

		// Drawerを閉じる
		await drawer.getByRole("button", { name: "閉じる" }).click();
		await expect(drawer).toBeHidden();
	});
});

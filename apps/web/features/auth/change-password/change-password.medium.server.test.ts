import { randomUUID } from "node:crypto";
import { createAdminClient } from "@repo/supabase/admin";
import { createClient } from "@repo/supabase/nextjs/server";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { test as base, expect, vi } from "vitest";
import { changePassword } from "./change-password";

// createClient をモックして、テスト用のSupabaseクライアントを返す
vi.mock("@repo/supabase/nextjs/server", async () => {
	const { createAdminClient } = await import("@repo/supabase/admin");
	return {
		createClient: vi.fn().mockImplementation(async () => {
			// テスト用のクライアントを返す（admin clientを使用）
			return createAdminClient();
		}),
	};
});

const test = base.extend<{
	cleanup: { authUserIds: string[]; staffIds: string[] };
	testUser: { authUserId: string; email: string; password: string };
}>({
	cleanup: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const authUserIds: string[] = [];
		const staffIds: string[] = [];
		await use({ authUserIds, staffIds });

		const supabase = createAdminClient();
		for (const staffId of staffIds) {
			await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
		}
		for (const authUserId of authUserIds) {
			await supabase.auth.admin.deleteUser(authUserId);
		}
	},
	testUser: async ({ cleanup }, use) => {
		const supabase = createAdminClient();
		const uniqueId = randomUUID().slice(0, 8);
		const email = `change-password-test-${uniqueId}@example.com`;
		const password = "Test@Pass123";
		const staffId = randomUUID();
		const authUserId = randomUUID();

		// スタッフを作成
		await db.insert(staffsTable).values({
			authUserId,
			firstName: "テスト",
			lastName: `ユーザー${uniqueId}`,
			staffId,
		});
		cleanup.staffIds.push(staffId);

		// Authユーザーを作成
		const { data, error } = await supabase.auth.admin.createUser({
			app_metadata: { role: "user", staffId },
			email,
			email_confirm: true,
			id: authUserId,
			password,
		});

		if (error) {
			throw new Error(`テストユーザーの作成に失敗: ${error.message}`);
		}

		cleanup.authUserIds.push(data.user.id);

		// createClient のモックを更新してこのユーザーを返す
		const mockClient = {
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: { email, id: authUserId } },
					error: null,
				}),
				signInWithPassword: vi
					.fn()
					.mockImplementation(async ({ password: inputPassword }) => {
						// 正しいパスワードの場合は成功
						if (inputPassword === password) {
							return { data: {}, error: null };
						}
						return { data: null, error: { message: "Invalid credentials" } };
					}),
				updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
			},
		};

		vi.mocked(createClient).mockResolvedValue(mockClient as never);

		await use({ authUserId, email, password });
	},
});

test("正しい現在のパスワードで新しいパスワードに変更できる", async ({
	testUser,
}) => {
	const newPassword = "NewPass@456";

	const result = await changePassword({
		currentPassword: testUser.password,
		newPassword,
	});

	expect(result.success).toBe(true);
});

test("間違った現在のパスワードでエラーが返る", async ({
	testUser: _testUser,
}) => {
	const wrongPassword = "WrongPass@123";
	const newPassword = "NewPass@456";

	const result = await changePassword({
		currentPassword: wrongPassword,
		newPassword,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("現在のパスワードが正しくありません");
	}
});

test("セッションが無効な場合エラーが返る", async () => {
	// createClient のモックを更新してセッションなしを返す
	vi.mocked(createClient).mockResolvedValue({
		auth: {
			getUser: vi.fn().mockResolvedValue({
				data: { user: null },
				error: null,
			}),
		},
	} as never);

	const result = await changePassword({
		currentPassword: "Current@123",
		newPassword: "NewPass@456",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("セッションが無効です。再度ログインしてください");
	}
});

test("パスワード更新に失敗した場合エラーが返る", async ({ testUser }) => {
	// createClient のモックを更新してupdateUserでエラーを返す
	vi.mocked(createClient).mockResolvedValue({
		auth: {
			getUser: vi.fn().mockResolvedValue({
				data: { user: { email: testUser.email, id: testUser.authUserId } },
				error: null,
			}),
			signInWithPassword: vi.fn().mockResolvedValue({
				data: {},
				error: null,
			}),
			updateUser: vi.fn().mockResolvedValue({
				data: null,
				error: { message: "Update failed" },
			}),
		},
	} as never);

	const result = await changePassword({
		currentPassword: testUser.password,
		newPassword: "NewPass@456",
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("パスワードの更新に失敗しました");
	}
});

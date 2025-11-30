import { randomUUID } from "node:crypto";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { test as base, expect } from "vitest";
import { registerStaff } from "./register-staff";

const test = base.extend<{
	cleanup: { staffIds: string[]; authUserIds: string[] };
}>({
	cleanup: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const staffIds: string[] = [];
		const authUserIds: string[] = [];
		await use({ authUserIds, staffIds });

		const supabase = createAdminClient();
		for (const staffId of staffIds) {
			const [staff] = await db
				.select({ authUserId: staffsTable.authUserId })
				.from(staffsTable)
				.where(eq(staffsTable.staffId, staffId))
				.limit(1);

			await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));

			if (staff?.authUserId) {
				await supabase.auth.admin.deleteUser(staff.authUserId);
			}
		}
		for (const authUserId of authUserIds) {
			await supabase.auth.admin.deleteUser(authUserId);
		}
	},
});

test("スタッフを正常に登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`,
		lastName: "テスト",
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerStaff(input);

	expect(result.success).toBe(true);
	if (result.success) {
		expect(result.data.staffId).toBeDefined();
		cleanup.staffIds.push(result.data.staffId);
	}

	if (!result.success) return;

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, result.data.staffId))
		.limit(1);

	expect(staffs).toHaveLength(1);
	expect(staffs[0]?.firstName).toBe(input.firstName);
	expect(staffs[0]?.lastName).toBe(input.lastName);

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const user = data.users.find((u) => u.email === input.email);
	expect(user).toBeDefined();
	expect(user?.app_metadata?.role).toBe(input.role);
	expect(user?.app_metadata?.staffId).toBe(result.data.staffId);
});

test("firstName と lastName が24文字（境界値）で登録できる", async ({
	cleanup,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-name24-${uniqueId}@example.com`,
		firstName: "あ".repeat(24),
		lastName: "い".repeat(24),
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerStaff(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.staffIds.push(result.data.staffId);
	}

	if (!result.success) return;

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.staffId, result.data.staffId))
		.limit(1);

	expect(staffs).toHaveLength(1);
	expect(staffs[0]?.firstName).toBe(input.firstName);
	expect(staffs[0]?.lastName).toBe(input.lastName);
});

test("管理者ロールで登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-admin-${uniqueId}@example.com`,
		firstName: `太郎${uniqueId}`,
		lastName: "管理者",
		password: "TestPassword123!",
		role: "admin" as const,
	};

	const result = await registerStaff(input);

	expect(result.success).toBe(true);
	if (result.success) {
		cleanup.staffIds.push(result.data.staffId);
	}

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const user = data.users.find((u) => u.email === input.email);
	expect(user?.app_metadata?.role).toBe("admin");
});

test("Supabase Auth に既に存在するメールアドレスで登録するとエラーになる", async ({
	cleanup,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const email = `staff-dup-${uniqueId}@example.com`;

	const supabase = createAdminClient();
	const { data: existingUser } = await supabase.auth.admin.createUser({
		email,
		email_confirm: true,
		password: "TestPassword123!",
	});
	if (existingUser.user) {
		cleanup.authUserIds.push(existingUser.user.id);
	}

	const input = {
		email,
		firstName: "太郎",
		lastName: "テスト",
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerStaff(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("このメールアドレスは既に登録されています");
	}
});

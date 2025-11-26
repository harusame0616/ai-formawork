import { randomUUID } from "node:crypto";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { test as base, expect } from "vitest";
import { registerStaff } from "./register-staff";

const test = base.extend<{
	cleanup: { emails: string[] };
}>({
	cleanup: async (
		// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
		{},
		use,
	) => {
		const emails: string[] = [];
		await use({ emails });

		const supabase = createAdminClient();
		for (const email of emails) {
			await db.delete(staffsTable).where(eq(staffsTable.email, email));

			const { data } = await supabase.auth.admin.listUsers();
			const user = data.users.find((u) => u.email === email);
			if (user) {
				await supabase.auth.admin.deleteUser(user.id);
			}
		}
	},
});

test("スタッフを正常に登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-${uniqueId}@example.com`,
		name: `テスト太郎${uniqueId}`,
		password: "TestPassword123!",
		role: "user" as const,
	};
	cleanup.emails.push(input.email);

	const result = await registerStaff(input);

	expect(result.success).toBe(true);
	if (result.success) {
		expect(result.data.staffId).toBeDefined();
	}

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.email, input.email))
		.limit(1);

	expect(staffs).toHaveLength(1);
	expect(staffs[0]?.name).toBe(input.name);
	expect(staffs[0]?.email).toBe(input.email);

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const user = data.users.find((u) => u.email === input.email);
	expect(user).toBeDefined();
	expect(user?.app_metadata?.role).toBe(input.role);
});

test("name が24文字（境界値）で登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-name24-${uniqueId}@example.com`,
		name: "あ".repeat(24),
		password: "TestPassword123!",
		role: "user" as const,
	};
	cleanup.emails.push(input.email);

	const result = await registerStaff(input);

	expect(result.success).toBe(true);

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.email, input.email))
		.limit(1);

	expect(staffs).toHaveLength(1);
	expect(staffs[0]?.name).toBe(input.name);
});

test("管理者ロールで登録できる", async ({ cleanup }) => {
	const uniqueId = randomUUID().slice(0, 8);
	const input = {
		email: `staff-admin-${uniqueId}@example.com`,
		name: `管理者太郎${uniqueId}`,
		password: "TestPassword123!",
		role: "admin" as const,
	};
	cleanup.emails.push(input.email);

	const result = await registerStaff(input);

	expect(result.success).toBe(true);

	const supabase = createAdminClient();
	const { data } = await supabase.auth.admin.listUsers();
	const user = data.users.find((u) => u.email === input.email);
	expect(user?.app_metadata?.role).toBe("admin");
});

test("DBに既に存在するメールアドレスで登録するとエラーになる", async ({
	cleanup,
}) => {
	const uniqueId = randomUUID().slice(0, 8);
	const email = `staff-dup-${uniqueId}@example.com`;
	cleanup.emails.push(email);

	await db.insert(staffsTable).values({
		email,
		id: randomUUID(),
		name: `既存スタッフ${uniqueId}`,
	});

	const input = {
		email,
		name: "テスト太郎",
		password: "TestPassword123!",
		role: "user" as const,
	};

	const result = await registerStaff(input);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("このメールアドレスは既に登録されています");
	}
});

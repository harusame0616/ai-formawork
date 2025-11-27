import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, type Mock, vi } from "vitest";
import { deleteStaff } from "./delete-staff";

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn().mockResolvedValue({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	}),
}));

vi.mock("@repo/supabase/admin", () => ({
	createAdminClient: vi.fn(),
}));

const test = base.extend<{
	staff: {
		email: string;
		id: string;
		name: string;
	};
	supabaseAdminMock: Mock;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async staff({}, use) {
		const staff = {
			email: `${v4()}@example.com`,
			id: v4(),
			name: v4().slice(0, 24),
		};

		await db.insert(staffsTable).values(staff);
		await use(staff);
		await db.delete(staffsTable).where(eq(staffsTable.id, staff.id));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	// biome-ignore lint/suspicious/noExplicitAny: https://github.com/vitest-dev/vitest/discussions/5710
	async supabaseAdminMock({}, use: any) {
		const supabaseModule = await import("@repo/supabase/admin");
		const mock = vi.mocked(supabaseModule.createAdminClient);
		await use(mock);
		vi.clearAllMocks();
	},
});

test("存在しないスタッフを削除しようとした場合にエラーが返される", async () => {
	const nonExistentStaffId = "99999999-9999-9999-9999-999999999999";
	const currentUserStaffId = "00000000-0000-0000-0000-000000000001";

	const result = await deleteStaff({
		currentUserStaffId,
		staffId: nonExistentStaffId,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("指定されたスタッフが見つかりません");
	}
});

test("自分自身を削除しようとした場合にエラーが返される", async ({ staff }) => {
	const result = await deleteStaff({
		currentUserStaffId: staff.id,
		staffId: staff.id,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("自分自身は削除できません");
	}
});

test("存在するスタッフを削除できる", async ({ staff, supabaseAdminMock }) => {
	const currentUserStaffId = "00000000-0000-0000-0000-000000000001";
	const authUserId = "auth-user-id";

	supabaseAdminMock.mockReturnValue({
		auth: {
			admin: {
				deleteUser: vi.fn().mockResolvedValue({ error: null }),
				listUsers: vi.fn().mockResolvedValue({
					data: {
						users: [
							{
								app_metadata: { staffId: staff.id },
								id: authUserId,
							},
						],
					},
					error: null,
				}),
			},
		},
	});

	const result = await deleteStaff({
		currentUserStaffId,
		staffId: staff.id,
	});

	expect(result.success).toBe(true);

	const [deletedStaff] = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.id, staff.id))
		.limit(1);

	expect(deletedStaff).toBeUndefined();
});

test("Auth ユーザーが見つからない場合にエラーが返される", async ({
	staff,
	supabaseAdminMock,
}) => {
	const currentUserStaffId = "00000000-0000-0000-0000-000000000001";

	supabaseAdminMock.mockReturnValue({
		auth: {
			admin: {
				listUsers: vi.fn().mockResolvedValue({
					data: {
						users: [],
					},
					error: null,
				}),
			},
		},
	});

	const result = await deleteStaff({
		currentUserStaffId,
		staffId: staff.id,
	});

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBe("認証ユーザーが見つかりません");
	}
});

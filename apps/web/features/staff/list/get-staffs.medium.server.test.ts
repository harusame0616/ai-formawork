import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { deleteStaff } from "../delete/delete-staff";
import { registerStaff } from "../register/register-staff";
import { getStaffs } from "./get-staffs";

vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	})),
}));

const test = base.extend<{
	staff: {
		id: string;
		name: string;
		email: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
	async staff({}, use) {
		const uniqueId = v4().slice(0, 8);
		const email = `test-staff-${uniqueId}@example.com`;
		const name = `テストスタッフ${uniqueId}`;

		const result = await registerStaff({
			email,
			name,
			password: "TestPassword123!",
			role: "user",
		});

		if (!result.success) {
			throw new Error("Failed to create staff");
		}

		await use({
			email,
			id: result.data.staffId,
			name,
		});

		await deleteStaff({
			currentUserStaffId: "dummy-user-id",
			staffId: result.data.staffId,
		});
	},
});

test("名前で検索できる", async ({ staff }) => {
	const nameSearchResult = await getStaffs({
		keyword: staff.name,
		page: 1,
	});

	expect(nameSearchResult.staffs.length).toBe(1);
});

test("大文字小文字を区別せずに検索できる", async ({ staff }) => {
	const nameSearchResult = await getStaffs({
		keyword: staff.name.toUpperCase(),
		page: 1,
	});

	expect(nameSearchResult.staffs.length).toBe(1);
});

test("メールアドレスで検索できる", async ({ staff }) => {
	const emailSearchResult = await getStaffs({
		keyword: staff.email,
		page: 1,
	});

	expect(emailSearchResult.staffs.length).toBe(1);
	expect(emailSearchResult.staffs[0]?.email).toBe(staff.email);
});

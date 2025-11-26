import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect, vi } from "vitest";
import { getStaffs } from "./get-staffs";

vi.mock("next/cache", () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

const test = base.extend<{
	staff: {
		id: string;
		email: string;
		name: string;
	};
}>({
	// biome-ignore lint/correctness/noEmptyPattern: The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "_".
	async staff({}, use) {
		const staff = {
			email: `${v4()}@staff.example.com`,
			id: v4(),
			name: v4().slice(0, 24),
		};

		await db.insert(staffsTable).values(staff);
		await use(staff);
		await db.delete(staffsTable).where(eq(staffsTable.id, staff.id));
	},
});

test("複数フィールドにマッチする検索ができる", async ({ staff }) => {
	const emailSearchResult = await getStaffs({
		keyword: staff.email,
		page: 1,
	});
	const nameSearchResult = await getStaffs({
		keyword: staff.name,
		page: 1,
	});

	expect(emailSearchResult.staffs.length).toBe(1);
	expect(nameSearchResult.staffs.length).toBe(1);
});

test("大文字小文字を区別せずに検索できる", async ({ staff }) => {
	const emailSearchResult = await getStaffs({
		keyword: staff.email.toUpperCase(),
		page: 1,
	});
	const nameSearchResult = await getStaffs({
		keyword: staff.name.toUpperCase(),
		page: 1,
	});

	expect(emailSearchResult.staffs.length).toBe(1);
	expect(nameSearchResult.staffs.length).toBe(1);
});

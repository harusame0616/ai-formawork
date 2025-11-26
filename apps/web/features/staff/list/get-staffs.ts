import { db } from "@workspace/db/client";
import type { SelectStaff } from "@workspace/db/schema/staff";
import { staffsTable } from "@workspace/db/schema/staff";
import { desc, ilike, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { StaffTag } from "../tag";
import type { StaffsCondition } from "./schema";

type GetStaffsResult = {
	staffs: SelectStaff[];
	page: number;
	totalPages: number;
};

export async function getStaffs({
	keyword,
	page,
}: StaffsCondition): Promise<GetStaffsResult> {
	"use cache";
	cacheLife("permanent");
	cacheTag(StaffTag.Crud);

	const pageSize = 20;
	const whereConditions = keyword
		? or(
				ilike(staffsTable.name, `%${keyword}%`),
				ilike(staffsTable.email, `%${keyword}%`),
			)
		: undefined;

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(whereConditions)
		.orderBy(desc(staffsTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db.$count(staffsTable, whereConditions);

	return {
		page,
		staffs,
		totalPages: Math.ceil(total / pageSize),
	};
}

import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { asc, eq, or, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { StaffTag } from "../tag";
import type { StaffsCondition } from "./schema";

type Staff = {
	email: string;
	firstName: string;
	lastName: string;
	staffId: string;
};

type GetStaffsResult = {
	staffs: Staff[];
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
		? or(eq(staffsTable.firstName, keyword), eq(staffsTable.lastName, keyword))
		: undefined;

	const staffs = await db
		.select({
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			firstName: staffsTable.firstName,
			lastName: staffsTable.lastName,
			staffId: staffsTable.staffId,
		})
		.from(staffsTable)
		.leftJoin(authUsers, eq(staffsTable.authUserId, authUsers.id))
		.where(whereConditions)
		.orderBy(asc(staffsTable.lastName), asc(staffsTable.firstName))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(staffsTable)
		.leftJoin(authUsers, eq(staffsTable.authUserId, authUsers.id))
		.where(whereConditions)
		.then((result) => Number(result[0]?.count ?? 0));

	return {
		page,
		staffs,
		totalPages: Math.ceil(total / pageSize),
	};
}

import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { StaffTag } from "../tag";

export const getStaffDetail = cache(async (staffId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(StaffTag.Crud);

	const staffs = await db
		.select()
		.from(staffsTable)
		.where(eq(staffsTable.id, staffId))
		.limit(1);

	return staffs[0] ?? null;
});

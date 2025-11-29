import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq, sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { UserRole } from "../../auth/user/role";
import { StaffTag } from "../tag";

export const getStaffDetail = cache(async (staffId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(StaffTag.Crud);

	const staffs = await db
		.select({
			authUserId: staffsTable.authUserId,
			createdAt: staffsTable.createdAt,
			email: sql<string>`COALESCE(${authUsers.email}, '')`,
			id: staffsTable.id,
			name: staffsTable.name,
			role: sql<string>`COALESCE("auth"."users".raw_app_meta_data->>'role', ${UserRole.Admin})`,
			updatedAt: staffsTable.updatedAt,
		})
		.from(staffsTable)
		.leftJoin(authUsers, eq(staffsTable.authUserId, authUsers.id))
		.where(eq(staffsTable.id, staffId))
		.limit(1);

	return staffs[0] ?? null;
});

import { fail, type Result, succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { RegisterStaffParams } from "./schema";

export async function registerStaff({
	email,
	name,
	password,
	role,
}: RegisterStaffParams): Promise<Result<{ staffId: string }, string>> {
	const existingStaff = await db
		.select({ id: staffsTable.id })
		.from(staffsTable)
		.where(eq(staffsTable.email, email))
		.limit(1);

	if (existingStaff.length > 0) {
		return fail("このメールアドレスは既に登録されています");
	}

	const supabase = createAdminClient();
	const staffId = uuidv7();

	return await db.transaction(async (tx) => {
		await tx.insert(staffsTable).values({ email, id: staffId, name });

		const { error } = await supabase.auth.admin.createUser({
			app_metadata: { role, staffId },
			email,
			email_confirm: true,
			password,
		});

		if (error) {
			if (error.message.includes("already registered")) {
				tx.rollback();
				return fail("このメールアドレスは既に登録されています");
			}
			throw error;
		}

		return succeed({ staffId });
	});
}

import { fail, type Result, succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import { staffsTable } from "@workspace/db/schema/staff";
import { v7 as uuidv7 } from "uuid";
import type { RegisterStaffParams } from "./schema";

export async function registerStaff({
	email,
	name,
	password,
	role,
}: RegisterStaffParams): Promise<Result<{ staffId: string }, string>> {
	const supabase = createAdminClient();
	const staffId = uuidv7();
	const authUserId = uuidv7();

	try {
		return await db.transaction(async (tx) => {
			await tx.insert(staffsTable).values({ authUserId, id: staffId, name });

			const { error } = await supabase.auth.admin.createUser({
				app_metadata: { role, staffId },
				email,
				email_confirm: true,
				id: authUserId,
				password,
			});

			if (error) {
				throw error;
			}

			return succeed({ staffId });
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("already") &&
			error.message.includes("registered")
		) {
			return fail("このメールアドレスは既に登録されています");
		}
		throw error;
	}
}

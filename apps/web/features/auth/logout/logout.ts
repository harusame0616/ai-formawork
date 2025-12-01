import { type Success, succeed } from "@harusame0616/result";
import { createClient } from "@repo/supabase/nextjs/server";

export async function logout(): Promise<Success<undefined>> {
	const supabase = await createClient();
	await supabase.auth.signOut();

	return succeed();
}

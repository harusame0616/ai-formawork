import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePrivateConfig } from "../config";

export async function createClient() {
	const cookieStore = await cookies();
	const supabaseConfig = getSupabasePrivateConfig();

	return createServerClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options);
					}
				} catch {
					// Server Componentから呼ばれた場合は無視
					// middlewareでセッション更新されていれば問題なし
				}
			},
		},
	});
}

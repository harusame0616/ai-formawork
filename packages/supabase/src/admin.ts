import { createClient } from "@supabase/supabase-js";
import { getSupabasePrivateConfig } from "./config";

/**
 * Service Role Key を使用した管理者用 Supabase クライアントを作成
 * Cookie 処理が不要なサーバーサイド専用の操作（Storage など）に使用
 */
export function createAdminClient() {
	const config = getSupabasePrivateConfig();

	return createClient(config.url, config.serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

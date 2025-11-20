import { createAdminClient } from "@repo/supabase/admin";
import { cacheLife } from "next/cache";

const BUCKET_NAME = "customer-note-attachments";
// 1.5日 = 129600秒
const SIGNED_URL_EXPIRY_SECONDS = 129600;

/**
 * 顧客ノート画像の閲覧用 signed URL を生成する
 * キャッシュ時間: 1日
 * signed URL 有効期限: 1.5日
 */
export async function getCustomerNoteImageUrl(
	path: string,
): Promise<string | null> {
	"use cache";
	cacheLife("days");

	const supabase = createAdminClient();

	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

	if (error) {
		console.error("Failed to create signed URL for image", {
			error,
			path,
		});
		return null;
	}

	return data.signedUrl;
}

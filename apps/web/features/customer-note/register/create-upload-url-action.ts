"use server";

import { fail, succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import * as v from "valibot";
import { createServerAction } from "@/libs/create-server-action";

const BUCKET_NAME = "customer-note-attachments";

const createUploadUrlSchema = v.object({
	fileId: v.pipe(v.string(), v.uuid()),
});

const UPLOAD_URL_CREATE_ERROR_MESSAGE =
	"署名付きアップロードURLの作成に失敗しました" as const;

export const createUploadUrlAction = createServerAction(
	async (input, { logger, userId }) => {
		const supabase = createAdminClient();
		const path = `temporary/${input.fileId}`;

		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.createSignedUploadUrl(path);

		if (error) {
			logger.error("署名付きアップロードURLの作成に失敗しました", {
				err: error,
				path,
			});
			return fail(UPLOAD_URL_CREATE_ERROR_MESSAGE);
		}

		logger.info("署名付きアップロードURLの作成に成功しました", {
			path,
			staffId: userId,
		});

		return succeed({
			path: data.path,
			signedUrl: data.signedUrl,
			token: data.token,
		});
	},
	{
		name: "createUploadUrlAction",
		schema: createUploadUrlSchema,
	},
);

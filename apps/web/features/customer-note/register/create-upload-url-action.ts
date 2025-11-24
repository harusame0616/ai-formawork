"use server";

import { fail, type Result, succeed } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import { getLogger } from "@repo/logger/nextjs/server";
import { createAdminClient } from "@repo/supabase/admin";
import * as v from "valibot";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const INVALID_INPUT_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type CreateUploadUrlActionErrorMessage =
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof INVALID_INPUT_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

const BUCKET_NAME = "customer-note-attachments";

const createUploadUrlSchema = v.object({
	fileId: v.pipe(v.string(), v.uuid()),
});

type CreateUploadUrlInput = v.InferInput<typeof createUploadUrlSchema>;

type CreateUploadUrlResult = {
	path: string;
	token: string;
	signedUrl: string;
};

export async function createUploadUrlAction(
	params: CreateUploadUrlInput,
): Promise<Result<CreateUploadUrlResult, CreateUploadUrlActionErrorMessage>> {
	const logger = await getLogger("createUploadUrlAction");
	logger.info("アップロードURLの作成を実行");

	const paramsParseResult = v.safeParse(createUploadUrlSchema, params);
	if (!paramsParseResult.success) {
		logger.warn("バリデーションに失敗しました", {
			event: EventType.InputValidationError,
			issues: paramsParseResult.issues,
		});
		return fail(INVALID_INPUT_ERROR_MESSAGE);
	}

	const { fileId } = paramsParseResult.output;

	const staffId = await getUserStaffId();
	if (!staffId) {
		logger.warn("未認証のアクセス", {
			event: EventType.AuthenticationFailure,
		});
		return fail(UNAUTHORIZED_ERROR_MESSAGE);
	}

	try {
		const supabase = createAdminClient();
		const path = `temporary/${fileId}`;

		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.createSignedUploadUrl(path);

		if (error) {
			logger.error("署名付きアップロードURLの作成に失敗しました", {
				err: error,
				path,
			});
			return fail(INTERNAL_SERVER_ERROR_MESSAGE);
		}

		logger.info("署名付きアップロードURLの作成に成功しました", {
			path,
			staffId,
		});

		return succeed({
			path: data.path,
			signedUrl: data.signedUrl,
			token: data.token,
		});
	} catch (error) {
		logger.error("予期しないエラーが発生しました", {
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

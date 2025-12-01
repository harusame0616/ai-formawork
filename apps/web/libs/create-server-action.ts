import { fail, type Result } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import type { Logger } from "@repo/logger/logger";
import { getLogger } from "@repo/logger/nextjs/server";
import { unstable_rethrow } from "next/navigation";
import type * as v from "valibot";
import * as valibot from "valibot";
import { getUserRole, type UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

const VALIDATION_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type ServerActionContext = {
	logger: Logger;
	role: UserRole | null;
	userId: string | null;
};

type BaseOptions<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
> = {
	name: string;
	schema?: TSchema;
	onSuccess?: (args: {
		input: v.InferOutput<TSchema>;
		result: TData;
	}) => void | Promise<void>;
	onFailure?: (args: {
		error: TError;
		input: v.InferOutput<TSchema>;
	}) => void | Promise<void>;
};

type PublicOptions<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
> = BaseOptions<TSchema, TData, TError> & {
	isPublic: true;
};

type PrivateOptions<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
> = BaseOptions<TSchema, TData, TError> & {
	isPublic?: false;
	role?: UserRole[];
};

type ServerActionOptions<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
> =
	| PublicOptions<TSchema, TData, TError>
	| PrivateOptions<TSchema, TData, TError>;

type ServerActionErrorMessage =
	| typeof VALIDATION_ERROR_MESSAGE
	| typeof UNAUTHORIZED_ERROR_MESSAGE
	| typeof FORBIDDEN_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

// schema ありの場合（引数あり）- より特定的なので先に配置
export function createServerAction<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
>(
	logicFunc: (
		input: v.InferOutput<TSchema>,
		context: ServerActionContext,
	) => Promise<Result<TData, TError>>,
	options: ServerActionOptions<TSchema, TData, TError> & { schema: TSchema },
): (
	input: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// schema なしの場合（引数なし）
export function createServerAction<TData, TError extends string>(
	logicFunc: (
		input: undefined,
		context: ServerActionContext,
	) => Promise<Result<TData, TError>>,
	options: Omit<
		ServerActionOptions<v.UndefinedSchema<undefined>, TData, TError>,
		"schema"
	>,
): () => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 実装
export function createServerAction<
	TSchema extends v.GenericSchema,
	TData,
	TError extends string,
>(
	logicFunc: (
		input: v.InferOutput<TSchema> | undefined,
		context: ServerActionContext,
	) => Promise<Result<TData, TError>>,
	options: ServerActionOptions<TSchema, TData, TError>,
): (
	input?: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>> {
	return async (
		input?: v.InferInput<TSchema>,
	): Promise<Result<TData, TError | ServerActionErrorMessage>> => {
		const logger = await getLogger(options.name);
		logger.info(`${options.name} を実行`, { input });

		let validatedInput: v.InferOutput<TSchema> =
			input as v.InferOutput<TSchema>;
		if (options.schema) {
			const parseResult = valibot.safeParse(options.schema, input);
			if (!parseResult.success) {
				logger.warn("バリデーション失敗", {
					event: EventType.InputValidationError,
					issues: parseResult.issues,
				});
				return fail(VALIDATION_ERROR_MESSAGE);
			}
			validatedInput = parseResult.output;
		}

		let userId: string | null = null;
		let role: UserRole | null = null;
		if (!options.isPublic) {
			userId = await getUserStaffId();
			if (!userId) {
				logger.warn("認証されていないアクセス", {
					event: EventType.AuthenticationFailure,
				});
				return fail(UNAUTHORIZED_ERROR_MESSAGE);
			}

			role = await getUserRole();
			if ("role" in options && options.role && options.role.length > 0) {
				if (!options.role.includes(role)) {
					logger.warn("権限がないアクセス", {
						event: EventType.AuthorizationError,
					});
					return fail(FORBIDDEN_ERROR_MESSAGE);
				}
			}
		}

		try {
			const result = await logicFunc(validatedInput, { logger, role, userId });

			if (result.success) {
				logger.info(`${options.name} 成功`);
				await options.onSuccess?.({
					input: validatedInput,
					result: result.data,
				});
			} else {
				logger.warn(`${options.name} 失敗`, { error: result.error });
				await options.onFailure?.({
					error: result.error,
					input: validatedInput,
				});
			}

			return result;
		} catch (error) {
			unstable_rethrow(error);
			logger.error(`${options.name} で予期しないエラーが発生`, { err: error });
			return fail(INTERNAL_SERVER_ERROR_MESSAGE);
		}
	};
}

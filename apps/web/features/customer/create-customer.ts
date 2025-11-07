import { fail, type Result, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import type * as v from "valibot";
import type { createCustomerSchema } from "./schema";

type CreateCustomerParams = v.InferOutput<typeof createCustomerSchema>;

const CreateCustomerErrorMessage =
	"顧客の作成に失敗しました。時間をおいて再度お試しいただくか、管理者にお問い合わせください。" as const;

export type CreateCustomerErrorMessage = typeof CreateCustomerErrorMessage;

const EmailDuplicateErrorMessage =
	"このメールアドレスは既に登録されています。別のメールアドレスをご使用ください。" as const;

export type EmailDuplicateErrorMessage = typeof EmailDuplicateErrorMessage;

type CreateCustomerError =
	| CreateCustomerErrorMessage
	| EmailDuplicateErrorMessage;

export async function createCustomer(
	params: CreateCustomerParams,
): Promise<Result<void, CreateCustomerError>> {
	try {
		await db.insert(customersTable).values({
			email: params.email,
			name: params.name,
		});

		return succeed();
	} catch (error) {
		// PostgreSQL unique constraint violation error code
		if (error instanceof Error && "code" in error && error.code === "23505") {
			return fail(EmailDuplicateErrorMessage);
		}

		return fail(CreateCustomerErrorMessage);
	}
}

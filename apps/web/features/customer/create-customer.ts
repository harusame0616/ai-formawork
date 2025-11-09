import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import type * as v from "valibot";
import type { customerFormSchema } from "./schema";

type CreateCustomerParams = v.InferOutput<typeof customerFormSchema>;

const CreateCustomerErrorMessage = {
	Conflict: "このメールアドレスは既に登録されています",
	Internal: "顧客の登録に失敗しました。時間をおいて再度お試しください",
} as const;

export type CreateCustomerErrorMessage =
	(typeof CreateCustomerErrorMessage)[keyof typeof CreateCustomerErrorMessage];

export async function createCustomer(
	params: CreateCustomerParams,
): Promise<Result<void, CreateCustomerErrorMessage>> {
	const logger = await getLogger("createCustomer");

	try {
		await db.insert(customersTable).values({
			email: params.email,
			name: params.name,
		});

		logger.info("Customer created successfully", {
			email: params.email,
			name: params.name,
		});

		return succeed();
	} catch (error) {
		// PostgreSQL unique constraint violation error code
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "23505"
		) {
			logger.warn("Customer creation failed: email already exists", {
				email: params.email,
				errorCode: error.code,
			});
			return fail(CreateCustomerErrorMessage.Conflict);
		}

		logger.error("Customer creation failed", {
			email: params.email,
			err: error,
		});
		return fail(CreateCustomerErrorMessage.Internal);
	}
}

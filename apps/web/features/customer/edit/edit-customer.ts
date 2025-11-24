import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";

const CUSTOMER_NOT_FOUND_ERROR_MESSAGE =
	"指定された顧客が見つかりません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
	"サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

type UpdateCustomerErrorMessage =
	| typeof CUSTOMER_NOT_FOUND_ERROR_MESSAGE
	| typeof INTERNAL_SERVER_ERROR_MESSAGE;

type EditCustomerInput = {
	customerId: string;
	email: string | null;
	name: string;
	phone: string | null;
};

export async function editCustomer({
	customerId,
	email,
	name,
	phone,
}: EditCustomerInput): Promise<Result<undefined, UpdateCustomerErrorMessage>> {
	const logger = await getLogger("updateCustomer");

	try {
		const customer = await db.query.customersTable.findFirst({
			where: eq(customersTable.customerId, customerId),
		});

		if (!customer) {
			logger.warn("顧客が見つかりません", {
				customerId,
			});
			return fail(CUSTOMER_NOT_FOUND_ERROR_MESSAGE);
		}

		await db
			.update(customersTable)
			.set({
				email,
				name,
				phone,
			})
			.where(eq(customersTable.customerId, customerId));

		logger.info("顧客情報の更新に成功", {
			action: "update-customer",
			customerId,
		});

		return succeed();
	} catch (error) {
		logger.error("顧客情報の更新に失敗", {
			action: "update-customer",
			err: error,
		});
		return fail(INTERNAL_SERVER_ERROR_MESSAGE);
	}
}

import { fail, type Result, succeed } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import type { EditCustomerParams } from "./schema";

const CUSTOMER_NOT_FOUND_ERROR_MESSAGE =
	"指定された顧客が見つかりません" as const;

export type EditCustomerErrorMessage = typeof CUSTOMER_NOT_FOUND_ERROR_MESSAGE;

export async function editCustomer({
	customerId,
	email,
	name,
	phone,
}: EditCustomerParams): Promise<Result<undefined, EditCustomerErrorMessage>> {
	const logger = await getLogger("editCustomer");

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
		action: "edit-customer",
		customerId,
	});

	return succeed();
}

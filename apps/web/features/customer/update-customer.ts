import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { TAG_CUSTOMER } from "./constants";

type UpdateCustomerParams = {
	customerId: string;
	email: string;
	name: string;
};

export async function updateCustomer(params: UpdateCustomerParams) {
	const logger = await getLogger("updateCustomer");

	logger.info("顧客を更新します", {
		customerId: params.customerId,
		email: params.email,
		name: params.name,
	});

	try {
		const [customer] = await db
			.update(customersTable)
			.set({
				email: params.email,
				name: params.name,
			})
			.where(eq(customersTable.customerId, params.customerId))
			.returning();

		if (!customer) {
			logger.warn("更新対象の顧客が見つかりませんでした", {
				customerId: params.customerId,
			});
			throw new Error("顧客が見つかりませんでした");
		}

		logger.info("顧客を更新しました", {
			customerId: params.customerId,
			email: params.email,
		});

		updateTag(TAG_CUSTOMER);

		return customer;
	} catch (error) {
		logger.error("顧客の更新に失敗しました", {
			customerId: params.customerId,
			err: error,
		});
		throw error;
	}
}

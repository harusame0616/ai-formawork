import { getLogger } from "@repo/logger/nextjs/server";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { updateTag } from "next/cache";
import { TAG_CUSTOMER } from "./constants";

type CreateCustomerParams = {
	email: string;
	name: string;
};

export async function createCustomer(params: CreateCustomerParams) {
	const logger = await getLogger("createCustomer");

	logger.info("顧客を作成します", { email: params.email, name: params.name });

	try {
		const [customer] = await db
			.insert(customersTable)
			.values({
				email: params.email,
				name: params.name,
			})
			.returning();

		if (!customer) {
			throw new Error("顧客の作成に失敗しました");
		}

		logger.info("顧客を作成しました", {
			customerId: customer.customerId,
			email: params.email,
		});

		updateTag(TAG_CUSTOMER);

		return customer;
	} catch (error) {
		logger.error("顧客の作成に失敗しました", {
			email: params.email,
			err: error,
		});
		throw error;
	}
}

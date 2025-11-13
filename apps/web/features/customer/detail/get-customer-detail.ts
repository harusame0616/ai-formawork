import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { tagByCustomerId } from "../tag";

export const getCustomerDetail = cache(async (customerId: string) => {
	"use cache";
	cacheLife("permanent");
	cacheTag(tagByCustomerId(customerId));

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.customerId, customerId))
		.limit(1);

	return customers[0] ?? null;
});

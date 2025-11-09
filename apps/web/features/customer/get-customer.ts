import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";

export async function getCustomer(customerId: string) {
	const [customer] = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.customerId, customerId))
		.limit(1);

	return customer || null;
}

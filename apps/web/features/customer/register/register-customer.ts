import { type Success, succeed } from "@harusame0616/result";
import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { generateUniqueId } from "@/libs/generate-unique-id";
import type { RegisterCustomerParams } from "./schema";

export async function registerCustomer({
	name,
	email,
	phone,
}: RegisterCustomerParams): Promise<Success<{ customerId: string }>> {
	const customerId = generateUniqueId();

	await db.insert(customersTable).values({
		customerId,
		email,
		name,
		phone,
	});

	return succeed({ customerId });
}

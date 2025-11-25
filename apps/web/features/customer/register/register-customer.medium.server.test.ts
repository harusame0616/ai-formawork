import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { eq } from "drizzle-orm";
import { expect, test } from "vitest";
import { registerCustomer } from "./register-customer";

test("name が24文字（境界値）で登録できる", async () => {
	const input = {
		email: `test-name-24-${Date.now()}@example.com`,
		name: "あ".repeat(24),
		phone: "",
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.name).toBe(input.name);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("email が254文字（境界値）で登録できる", async () => {
	const input = {
		email: `${"a".repeat(242)}@example.com`,
		name: "テスト太郎",
		phone: "",
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.email).toBe(input.email);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

test("phone が20文字（境界値）で登録できる", async () => {
	const input = {
		email: `test-phone-20-${Date.now()}@example.com`,
		name: "テスト太郎",
		phone: "0".repeat(20),
	};

	const result = await registerCustomer(input);

	expect(result.success).toBe(true);

	const customers = await db
		.select()
		.from(customersTable)
		.where(eq(customersTable.email, input.email))
		.limit(1);

	expect(customers).toHaveLength(1);
	expect(customers[0]?.phone).toBe(input.phone);

	await db.delete(customersTable).where(eq(customersTable.email, input.email));
});

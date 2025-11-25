import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const customersTable = pgTable("customers", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	customerId: uuid("customer_id").primaryKey(),
	email: text("email").notNull(),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertCustomer = typeof customersTable.$inferInsert;

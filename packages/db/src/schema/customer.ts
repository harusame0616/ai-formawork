import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	email: text("email").notNull().unique(),
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

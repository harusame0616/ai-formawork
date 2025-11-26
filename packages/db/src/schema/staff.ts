import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const staffsTable = pgTable("staffs", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	email: text("email").notNull(),
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export type SelectStaff = typeof staffsTable.$inferSelect;
export type InsertStaff = typeof staffsTable.$inferInsert;

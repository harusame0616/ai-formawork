import {
	bigint,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { customersTable } from "./customer";
import { staffsTable } from "./staff";

export const customerNotesTable = pgTable("customer_notes", {
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	customerId: uuid("customer_id")
		.notNull()
		.references(() => customersTable.customerId, { onDelete: "cascade" }),
	id: uuid("id").primaryKey().defaultRandom(),
	staffId: uuid("staff_id")
		.notNull()
		.references(() => staffsTable.id, { onDelete: "cascade" }),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const customerNoteImagesTable = pgTable("customer_note_images", {
	alternativeText: text("alternative_text"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	customerNoteId: uuid("customer_note_id")
		.notNull()
		.references(() => customerNotesTable.id, { onDelete: "cascade" }),
	displayOrder: integer("display_order").notNull(),
	fileName: text("file_name").notNull(),
	fileSize: bigint("file_size", { mode: "number" }).notNull(),
	id: uuid("id").primaryKey().defaultRandom(),
	imageUrl: text("image_url").notNull(),
});

export type SelectCustomerNote = typeof customerNotesTable.$inferSelect;
export type InsertCustomerNote = typeof customerNotesTable.$inferInsert;
export type SelectCustomerNoteImage =
	typeof customerNoteImagesTable.$inferSelect;
export type InsertCustomerNoteImage =
	typeof customerNoteImagesTable.$inferInsert;

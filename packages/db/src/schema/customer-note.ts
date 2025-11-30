import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { customersTable } from "./customer";
import { staffsTable } from "./staff";

export const customerNotesTable = pgTable(
	"customer_notes",
	{
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		customerId: uuid("customer_id")
			.notNull()
			.references(() => customersTable.customerId, { onDelete: "cascade" }),
		id: uuid("id").primaryKey().defaultRandom(),
		staffId: uuid("staff_id")
			.notNull()
			.references(() => staffsTable.staffId, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		customerCreatedIdx: index("idx_customer_notes_customer_created").on(
			table.customerId,
			table.createdAt.desc(),
		),
		staffIdIdx: index("idx_customer_notes_staff_id").on(table.staffId),
	}),
);

export const customerNoteImagesTable = pgTable(
	"customer_note_images",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		customerNoteId: uuid("customer_note_id")
			.notNull()
			.references(() => customerNotesTable.id, { onDelete: "cascade" }),
		displayOrder: integer("display_order").notNull(),
		path: text("path").notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.customerNoteId, table.displayOrder] }),
	}),
);

export type SelectCustomerNote = typeof customerNotesTable.$inferSelect;
export type InsertCustomerNote = typeof customerNotesTable.$inferInsert;
export type SelectCustomerNoteImage =
	typeof customerNoteImagesTable.$inferSelect;
export type InsertCustomerNoteImage =
	typeof customerNoteImagesTable.$inferInsert;

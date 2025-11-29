import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const staffsTable = pgTable("staffs", {
	// auth.users への外部キー制約を設けない理由:
	// スタッフ登録時に先にスタッフレコードを作成し、その後 auth user を作成するため
	// 外部キー制約があると、存在しない auth user への参照でエラーになる
	authUserId: uuid("auth_user_id").unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export type SelectStaff = typeof staffsTable.$inferSelect;
export type InsertStaff = typeof staffsTable.$inferInsert;

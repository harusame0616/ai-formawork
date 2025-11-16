"use cache";

import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
	type SelectCustomerNote,
	type SelectCustomerNoteImage,
} from "@workspace/db/schema/customer-note";
import { staffsTable } from "@workspace/db/schema/staff";
import { and, desc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";

type NoteAuthor = {
	staffId: string;
	name: string;
};

export type CustomerNoteSearchCondition = {
	customerId: string;
	dateFrom?: Date;
	dateTo?: Date;
	keyword?: string;
	page?: number;
};

export type CustomerNoteWithImages = SelectCustomerNote & {
	images: SelectCustomerNoteImage[];
};

const NOTES_PER_PAGE = 20;

export async function getCustomerNotes(
	condition: CustomerNoteSearchCondition,
): Promise<{
	notes: CustomerNoteWithImages[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	authors: NoteAuthor[];
}> {
	cacheTag("customer-notes");

	const page = condition.page ?? 1;
	const offset = (page - 1) * NOTES_PER_PAGE;

	// フィルタ条件を構築
	const filters = [eq(customerNotesTable.customerId, condition.customerId)];

	if (condition.dateFrom) {
		filters.push(gte(customerNotesTable.createdAt, condition.dateFrom));
	}

	if (condition.dateTo) {
		filters.push(lt(customerNotesTable.createdAt, condition.dateTo));
	}

	// キーワード検索（本文 OR 記入者の名前）
	if (condition.keyword) {
		// キーワードに一致する名前を持つスタッフIDを取得
		const matchedStaffs = await db
			.select({ id: staffsTable.id })
			.from(staffsTable)
			.where(
				sql`lower(${staffsTable.name}) LIKE lower(${`%${condition.keyword}%`})`,
			);

		const matchedStaffIds = matchedStaffs.map((staff) => staff.id);

		// 本文検索とスタッフ名検索のOR条件
		const keywordFilters = [];

		// 本文検索
		keywordFilters.push(
			sql`lower(${customerNotesTable.content}) LIKE lower(${`%${condition.keyword}%`})`,
		);

		// スタッフ名検索（該当スタッフが存在する場合）
		if (matchedStaffIds.length > 0) {
			keywordFilters.push(inArray(customerNotesTable.staffId, matchedStaffIds));
		}

		filters.push(or(...keywordFilters));
	}

	// ノートを取得（新しい順、ページング）
	const notes = await db
		.select()
		.from(customerNotesTable)
		.where(and(...filters))
		.orderBy(desc(customerNotesTable.createdAt))
		.limit(NOTES_PER_PAGE)
		.offset(offset);

	// 取得したノートのIDリストを作成
	const noteIds = notes.map((note) => note.id);

	// ノートに紐づく画像を一括取得
	const images =
		noteIds.length > 0
			? await db
					.select()
					.from(customerNoteImagesTable)
					.where(inArray(customerNoteImagesTable.customerNoteId, noteIds))
					.orderBy(customerNoteImagesTable.displayOrder)
			: [];

	// 画像をノートごとにグループ化
	const imagesByNoteId = images.reduce(
		(acc, image) => {
			if (!acc[image.customerNoteId]) {
				acc[image.customerNoteId] = [];
			}
			acc[image.customerNoteId]?.push(image);
			return acc;
		},
		{} as Record<string, SelectCustomerNoteImage[]>,
	);

	// ノートと画像を結合
	const notesWithImages: CustomerNoteWithImages[] = notes.map((note) => ({
		...note,
		images: imagesByNoteId[note.id] ?? [],
	}));

	// 総件数を取得
	const totalCountResult = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(customerNotesTable)
		.where(and(...filters));

	const totalCount = totalCountResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalCount / NOTES_PER_PAGE);

	// ノートの作成者情報を取得
	const staffIds = [...new Set(notes.map((note) => note.staffId))];
	const staffs = await db
		.select()
		.from(staffsTable)
		.where(inArray(staffsTable.id, staffIds));

	const authors: NoteAuthor[] = staffs.map((staff) => ({
		name: staff.name,
		staffId: staff.id,
	}));

	return {
		authors,
		currentPage: page,
		notes: notesWithImages,
		totalCount,
		totalPages,
	};
}

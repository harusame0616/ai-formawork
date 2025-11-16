"use cache";

import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
	type SelectCustomerNote,
	type SelectCustomerNoteImage,
} from "@workspace/db/schema/customer-note";
import { staffsTable } from "@workspace/db/schema/staff";
import {
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	lt,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { cacheTag } from "next/cache";

export type CustomerNoteSearchCondition = {
	customerId: string;
	dateFrom?: Date;
	dateTo?: Date;
	keyword?: string;
	page?: number;
};

export type CustomerNoteWithImages = SelectCustomerNote & {
	images: SelectCustomerNoteImage[];
	staffName: string | null;
};

const NOTES_PER_PAGE = 20;

export async function getCustomerNotes(
	condition: CustomerNoteSearchCondition,
): Promise<{
	notes: CustomerNoteWithImages[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
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
		// JOINしたstaffsテーブルで直接検索（事前クエリ不要）
		// 2つの引数を渡しているためundefinedにはならない
		const keywordFilter = or(
			// 本文検索
			ilike(customerNotesTable.content, `%${condition.keyword}%`),
			// スタッフ名検索
			ilike(staffsTable.name, `%${condition.keyword}%`),
		) as SQL<unknown>;

		filters.push(keywordFilter);
	}

	// ノート、スタッフ情報、画像を一括取得（LEFT JOIN + json_agg）
	const notesWithImages = await db
		.select({
			content: customerNotesTable.content,
			createdAt: customerNotesTable.createdAt,
			customerId: customerNotesTable.customerId,
			id: customerNotesTable.id,
			images: sql<SelectCustomerNoteImage[]>`COALESCE(json_agg(
				json_build_object(
					'id', ${customerNoteImagesTable.id},
					'customerNoteId', ${customerNoteImagesTable.customerNoteId},
					'imageUrl', ${customerNoteImagesTable.imageUrl},
					'fileName', ${customerNoteImagesTable.fileName},
					'fileSize', ${customerNoteImagesTable.fileSize},
					'alternativeText', ${customerNoteImagesTable.alternativeText},
					'displayOrder', ${customerNoteImagesTable.displayOrder},
					'createdAt', ${customerNoteImagesTable.createdAt}
				) ORDER BY ${customerNoteImagesTable.displayOrder}
			) FILTER (WHERE ${customerNoteImagesTable.id} IS NOT NULL), '[]')`,
			staffId: customerNotesTable.staffId,
			staffName: staffsTable.name,
			updatedAt: customerNotesTable.updatedAt,
		})
		.from(customerNotesTable)
		.leftJoin(staffsTable, eq(customerNotesTable.staffId, staffsTable.id))
		.leftJoin(
			customerNoteImagesTable,
			eq(customerNotesTable.id, customerNoteImagesTable.customerNoteId),
		)
		.where(and(...filters))
		.groupBy(
			customerNotesTable.id,
			customerNotesTable.content,
			customerNotesTable.customerId,
			customerNotesTable.staffId,
			customerNotesTable.createdAt,
			customerNotesTable.updatedAt,
			staffsTable.name,
		)
		.orderBy(desc(customerNotesTable.createdAt))
		.limit(NOTES_PER_PAGE)
		.offset(offset);

	const totalCountResult = await db
		.select({
			count: count(),
		})
		.from(customerNotesTable)
		.leftJoin(staffsTable, eq(customerNotesTable.staffId, staffsTable.id))
		.where(and(...filters));

	const totalCount = totalCountResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalCount / NOTES_PER_PAGE);

	return {
		currentPage: page,
		notes: notesWithImages,
		totalCount,
		totalPages,
	};
}

"use cache";

import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
	type SelectCustomerNote,
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
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "../tag";
import { getCustomerNoteImageUrl } from "./get-customer-note-image-url";

export type CustomerNoteSearchCondition = {
	customerId: string;
	dateFrom?: Date;
	dateTo?: Date;
	keyword?: string;
	page?: number;
};

export type CustomerNoteImageWithUrl = {
	customerNoteId: string;
	path: string;
	displayOrder: number;
	createdAt: Date;
	url: string | null;
};

export type CustomerNoteWithImages = SelectCustomerNote & {
	images: CustomerNoteImageWithUrl[];
	staffName: string | null;
};

type RawCustomerNoteImage = {
	customerNoteId: string;
	path: string;
	displayOrder: number;
	createdAt: string;
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
	cacheTag(CustomerTag.NoteCrud(condition.customerId));
	cacheLife("permanent");

	const page = condition.page ?? 1;
	const offset = (page - 1) * NOTES_PER_PAGE;

	const filters: (SQL<unknown> | undefined)[] = [
		eq(customerNotesTable.customerId, condition.customerId),
	];

	if (condition.dateFrom) {
		filters.push(gte(customerNotesTable.createdAt, condition.dateFrom));
	}

	if (condition.dateTo) {
		filters.push(lt(customerNotesTable.createdAt, condition.dateTo));
	}

	if (condition.keyword) {
		filters.push(
			or(
				ilike(customerNotesTable.content, `%${condition.keyword}%`),
				ilike(staffsTable.name, `%${condition.keyword}%`),
			),
		);
	}

	const notesWithImages = await db
		.select({
			content: customerNotesTable.content,
			createdAt: customerNotesTable.createdAt,
			customerId: customerNotesTable.customerId,
			id: customerNotesTable.id,
			images: sql<RawCustomerNoteImage[]>`COALESCE(json_agg(
				json_build_object(
					'customerNoteId', ${customerNoteImagesTable.customerNoteId},
					'path', ${customerNoteImagesTable.path},
					'displayOrder', ${customerNoteImagesTable.displayOrder},
					'createdAt', ${customerNoteImagesTable.createdAt}
				) ORDER BY ${customerNoteImagesTable.displayOrder}
			) FILTER (WHERE ${customerNoteImagesTable.customerNoteId} IS NOT NULL), '[]')`,
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

	// 画像に signed URL を付与
	const notesWithSignedUrls: CustomerNoteWithImages[] = await Promise.all(
		notesWithImages.map(async (note) => {
			const imagesWithUrls = await Promise.all(
				note.images.map(async (image) => ({
					createdAt: new Date(image.createdAt),
					customerNoteId: image.customerNoteId,
					displayOrder: image.displayOrder,
					path: image.path,
					url: await getCustomerNoteImageUrl(image.path),
				})),
			);

			return {
				...note,
				images: imagesWithUrls,
			};
		}),
	);

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
		notes: notesWithSignedUrls,
		totalCount,
		totalPages,
	};
}

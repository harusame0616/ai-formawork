"use server";

import { randomUUID } from "node:crypto";
import { succeed } from "@harusame0616/result";
import { createAdminClient } from "@repo/supabase/admin";
import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "@workspace/db/schema/customer-note";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";

const BUCKET_NAME = "customer-note-attachments";

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const registerCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	customerId: v.pipe(v.string(), v.uuid()),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

export const registerCustomerNoteAction = createServerAction(
	async (input, { logger, userId }) => {
		const { content, customerId, uploadImages } = input;
		// biome-ignore lint/style/noNonNullAssertion: isPublic: false のため認証済みで非null
		const staffId = userId!;

		const noteId = randomUUID();
		const supabase = createAdminClient();

		await db.transaction(async (tx) => {
			await tx.insert(customerNotesTable).values({
				content,
				customerId,
				id: noteId,
				staffId,
			});

			if (uploadImages.length > 0) {
				const moveResults = await Promise.all(
					uploadImages.map(async (uploadImage, i) => {
						const { permanentPath, temporaryPath } = uploadImage;

						const { error: moveError } = await supabase.storage
							.from(BUCKET_NAME)
							.move(temporaryPath, permanentPath);

						if (moveError) {
							logger.error("Failed to move image file", {
								displayOrder: i,
								err: moveError,
								permanentPath,
								temporaryPath,
							});
							throw new Error(
								`Failed to move image file: ${moveError.message}`,
							);
						}

						return {
							displayOrder: i,
							path: permanentPath,
						};
					}),
				);

				await tx.insert(customerNoteImagesTable).values(
					moveResults.map((result) => ({
						customerNoteId: noteId,
						displayOrder: result.displayOrder,
						path: result.path,
					})),
				);
			}
		});

		return succeed();
	},
	{
		name: "registerCustomerNoteAction",
		onSuccess: ({ input }) => {
			updateTag(CustomerTag.NoteCrud(input.customerId));
		},
		schema: registerCustomerNoteSchema,
	},
);

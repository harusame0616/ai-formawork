"use server";

import { succeed } from "@harusame0616/result";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { editCustomerNote } from "./edit-customer-note";

const uploadImageSchema = v.object({
	permanentPath: v.string(),
	temporaryPath: v.string(),
});

const editCustomerNoteSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
	keepImagePaths: v.optional(v.array(v.string()), []),
	noteId: v.pipe(v.string(), v.uuid()),
	uploadImages: v.optional(v.array(uploadImageSchema), []),
});

export const editCustomerNoteAction = createServerAction(
	async (input, { role, userId }) => {
		const { content, keepImagePaths, noteId, uploadImages } = input;

		// biome-ignore lint/style/noNonNullAssertion: isPublic: false のため認証済みで非null
		const user = { role: role!, userId: userId! };
		const result = await editCustomerNote({
			content,
			customerNoteId: noteId,
			keepImagePaths,
			uploadImages,
			user,
		});

		if (!result.success) {
			return result;
		}

		return succeed({ customerId: result.data.customerId });
	},
	{
		name: "editCustomerNoteAction",
		onSuccess: ({ result }) => {
			updateTag(CustomerTag.NoteCrud(result.customerId));
		},
		schema: editCustomerNoteSchema,
	},
);

"use server";

import { succeed } from "@harusame0616/result";
import { updateTag } from "next/cache";
import * as v from "valibot";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteCustomerNote } from "./delete-customer-note";

const deleteCustomerNoteSchema = v.object({
	noteId: v.pipe(v.string(), v.uuid()),
});

export const deleteCustomerNoteAction = createServerAction(
	async (input, { role, userId }) => {
		// biome-ignore lint/style/noNonNullAssertion: isPublic: false のため認証済みで非null
		const user = { role: role!, userId: userId! };
		const result = await deleteCustomerNote({
			customerNoteId: input.noteId,
			user,
		});

		if (!result.success) {
			return result;
		}

		return succeed({ customerId: result.data.customerId });
	},
	{
		name: "deleteCustomerNoteAction",
		onSuccess: ({ result }) => {
			updateTag(CustomerTag.NoteCrud(result.customerId));
		},
		schema: deleteCustomerNoteSchema,
	},
);

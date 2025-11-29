"use server";

import { succeed } from "@harusame0616/result";
import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { tagByCustomerId } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { editCustomer } from "./edit-customer";
import { editCustomerSchema } from "./schema";

export const editCustomerAction = createServerAction(
	async (input) => {
		const result = await editCustomer(input);
		if (!result.success) {
			return result;
		}
		return succeed({ customerId: input.customerId });
	},
	{
		name: "editCustomerAction",
		onSuccess: ({ input }) => {
			updateTag(tagByCustomerId(input.customerId));
		},
		role: [UserRole.Admin],
		schema: editCustomerSchema,
	},
);

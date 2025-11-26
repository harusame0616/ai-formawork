"use server";

import { updateTag } from "next/cache";
import { RedirectType, redirect } from "next/navigation";
import * as v from "valibot";
import { UserRole } from "@/features/auth/get-user-role";
import { CustomerTag } from "@/features/customer/tag";
import { createServerAction } from "@/libs/create-server-action";
import { deleteCustomer } from "./delete-customer";

const deleteCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
});

export const deleteCustomerAction = createServerAction(deleteCustomer, {
	name: "deleteCustomerAction",
	onSuccess: ({ input }) => {
		updateTag(CustomerTag.crud);
		updateTag(CustomerTag.NoteCrud(input.customerId));
		redirect("/customers", RedirectType.replace);
	},
	role: [UserRole.Admin],
	schema: deleteCustomerSchema,
});

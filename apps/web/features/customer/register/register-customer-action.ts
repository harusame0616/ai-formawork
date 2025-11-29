"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { CustomerTag, tagByCustomerId } from "../tag";
import { registerCustomer } from "./register-customer";
import { registerCustomerSchema } from "./schema";

export const registerCustomerAction = createServerAction(registerCustomer, {
	name: "registerCustomerAction",
	onSuccess: ({ result }) => {
		updateTag(CustomerTag.crud);
		updateTag(tagByCustomerId(result.customerId));
	},
	role: [UserRole.Admin],
	schema: registerCustomerSchema,
});

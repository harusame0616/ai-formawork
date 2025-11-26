"use server";

import { updateTag } from "next/cache";
import { UserRole } from "@/features/auth/get-user-role";
import { createServerAction } from "@/libs/create-server-action";
import { StaffTag } from "../tag";
import { registerStaff } from "./register-staff";
import { registerStaffSchema } from "./schema";

export const registerStaffAction = createServerAction(registerStaff, {
	name: "registerStaffAction",
	onSuccess: () => {
		updateTag(StaffTag.Crud);
	},
	role: [UserRole.Admin],
	schema: registerStaffSchema,
});

"use server";

import { RedirectType, redirect } from "next/navigation";
import { createServerAction } from "@/libs/create-server-action";
import { changePassword } from "./change-password";
import { changePasswordSchema } from "./schema";

export const changePasswordAction = createServerAction(changePassword, {
	name: "changePasswordAction",
	onSuccess: () => {
		redirect("/", RedirectType.replace);
	},
	schema: changePasswordSchema,
});

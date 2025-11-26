"use server";

import { RedirectType, redirect } from "next/navigation";
import { login } from "@/features/auth/login/login";
import { loginSchema } from "@/features/auth/schema";
import { createServerAction } from "@/libs/create-server-action";

export const loginAction = createServerAction(login, {
	isPublic: true,
	name: "loginAction",
	onSuccess: () => {
		redirect("/", RedirectType.replace);
	},
	schema: loginSchema,
});

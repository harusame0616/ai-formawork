"use server";

import { RedirectType, redirect } from "next/navigation";
import { createServerAction } from "../../../libs/create-server-action";
import { logout } from "./logout";

export const logoutAction = createServerAction(logout, {
	name: "logoutAction",
	onSuccess: () => {
		redirect("/login", RedirectType.replace);
	},
});

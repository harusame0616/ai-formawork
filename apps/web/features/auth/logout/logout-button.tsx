"use client";

import { Button } from "@workspace/ui/components/button";
import { useTransition } from "react";
import { LoadingIcon } from "@/components/loading-icon";
import { logoutAction } from "./logout-action";

export function LogoutButton() {
	const [isPending, startTransition] = useTransition();

	const handleOnClick = () => {
		startTransition(async () => {
			await logoutAction();
		});
	};

	return (
		<Button
			className="w-full justify-start"
			disabled={isPending}
			onClick={handleOnClick}
			variant="ghost"
		>
			{isPending && <LoadingIcon className="mr-2" />}
			ログアウト
		</Button>
	);
}

"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
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
			{isPending && <Loader2 className="animate-spin" />}
			ログアウト
		</Button>
	);
}

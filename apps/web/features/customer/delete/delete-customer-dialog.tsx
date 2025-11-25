"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCustomerAction } from "./delete-customer-action";

type DeleteCustomerDialogProps = {
	customerId: string;
};

export function DeleteCustomerDialog({
	customerId,
}: DeleteCustomerDialogProps) {
	const _router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	function handleDelete() {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await deleteCustomerAction({ customerId });

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			setErrorMessage(null);
		});
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setErrorMessage(null);
		}
		setOpen(open);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="destructive">
					<Trash2 className="h-4 w-4 mr-1" />
					削除
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>顧客を削除</DialogTitle>
					<DialogDescription>
						この顧客を削除してもよろしいですか？関連するすべてのノートと画像も削除されます。この操作は取り消せません。
					</DialogDescription>
				</DialogHeader>

				{errorMessage && (
					<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
						<AlertCircle className="h-4 w-4 shrink-0" />
						<p>{errorMessage}</p>
					</div>
				)}

				<DialogFooter>
					<Button
						disabled={isPending}
						onClick={() => handleOpenChange(false)}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						className="min-w-[120px]"
						disabled={isPending}
						onClick={handleDelete}
						type="button"
						variant="destructive"
					>
						{isPending ? (
							<>
								削除中
								<Loader2 className="ml-2 size-4 animate-spin" />
							</>
						) : (
							"削除"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

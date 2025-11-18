"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { registerCustomerNoteAction } from "./register-customer-note-action";

const formSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
});

type FormValues = v.InferOutput<typeof formSchema>;

type RegisterCustomerNoteDialogProps = {
	customerId: string;
};

export function RegisterCustomerNoteDialog({
	customerId,
}: RegisterCustomerNoteDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm<FormValues>({
		defaultValues: {
			content: "",
		},
		resolver: valibotResolver(formSchema),
	});

	function onSubmit(values: FormValues) {
		setErrorMessage(null);

		startTransition(async () => {
			const result = await registerCustomerNoteAction({
				content: values.content,
				customerId,
			});

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			form.reset();
			setErrorMessage(null);
			setOpen(false);
			router.refresh();
		});
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			form.reset();
			setErrorMessage(null);
		}
		setOpen(open);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					ノートを追加
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ノートを追加</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						{errorMessage && (
							<div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<p>{errorMessage}</p>
							</div>
						)}

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>内容</FormLabel>
									<FormDescription>
										顧客に関するメモや連絡事項を記録できます
									</FormDescription>
									<FormControl>
										<Textarea
											{...field}
											className="max-h-32"
											disabled={isPending}
											maxLength={4096}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
								className="min-w-[120]"
								disabled={isPending}
								type="submit"
							>
								{isPending ? (
									<>
										登録中
										<Loader2 className="ml-2 size-4 animate-spin" />
									</>
								) : (
									"登録"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

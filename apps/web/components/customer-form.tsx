"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
	type CustomerFormSchema,
	customerFormSchema,
} from "../features/customer/schema";
import { useIsHydrated } from "../libs/use-is-hydrated";

type CustomerFormProps = {
	defaultValues?: CustomerFormSchema;
	onSubmit: (
		values: CustomerFormSchema,
	) => Promise<{ success: boolean; error?: string }>;
	submitLabel: string;
};

export function CustomerForm({
	defaultValues = { email: "", name: "" },
	onSubmit,
	submitLabel,
}: CustomerFormProps) {
	const [isPending, startTransition] = useTransition();
	const { isHydrated } = useIsHydrated();

	const form = useForm<CustomerFormSchema>({
		defaultValues,
		resolver: valibotResolver(customerFormSchema),
	});

	function handleSubmit(values: CustomerFormSchema) {
		form.clearErrors("root");
		startTransition(async () => {
			const result = await onSubmit(values);
			if (!result.success) {
				form.setError("root", {
					message: result.error,
				});
			}
			// 成功時はredirect()によって自動的にリダイレクトされる
		});
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(handleSubmit)}
			>
				<FormField
					control={form.control}
					disabled={!isHydrated}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>顧客名</FormLabel>
							<FormControl>
								<Input autoComplete="name" type="text" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					disabled={!isHydrated}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>メールアドレス</FormLabel>
							<FormControl>
								<Input autoComplete="email" type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.formState.errors.root && (
					<div className="text-sm text-destructive" role="alert">
						{form.formState.errors.root.message}
					</div>
				)}
				<Button
					className="w-full"
					disabled={isPending || !isHydrated}
					type="submit"
				>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							処理中...
						</>
					) : (
						submitLabel
					)}
				</Button>
			</form>
		</Form>
	);
}

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
import { useIsHydrated } from "../../libs/use-is-hydrated";
import { type CustomerFormSchema, customerFormSchema } from "./schema";

type CustomerFormProps = {
	defaultValues?: CustomerFormSchema;
	onSubmit: (values: CustomerFormSchema) => Promise<{ error?: string }>;
	submitButtonText: string;
	submittingButtonText: string;
};

export function CustomerForm({
	defaultValues = { email: "", name: "" },
	onSubmit,
	submitButtonText,
	submittingButtonText,
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
			if (result.error) {
				form.setError("root", {
					message: result.error,
				});
			}
			// 成功時はonSubmit内でredirect()が呼ばれる想定
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
							{submittingButtonText}
						</>
					) : (
						submitButtonText
					)}
				</Button>
			</form>
		</Form>
	);
}

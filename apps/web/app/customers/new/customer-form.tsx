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
	type CreateCustomerSchema,
	createCustomerSchema,
} from "../../../features/customer/schema";
import { createCustomerAction } from "./create-customer-action";

export function CustomerForm() {
	const [isPending, startTransition] = useTransition();

	const form = useForm<CreateCustomerSchema>({
		defaultValues: {
			email: "",
			name: "",
		},
		resolver: valibotResolver(createCustomerSchema),
	});

	function onSubmit(values: CreateCustomerSchema) {
		form.clearErrors("root");
		startTransition(async () => {
			const result = await createCustomerAction(values);
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
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>顧客名</FormLabel>
							<FormControl>
								<Input
									autoComplete="name"
									id="name"
									placeholder="山田 太郎"
									type="text"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>メールアドレス</FormLabel>
							<FormControl>
								<Input
									autoComplete="email"
									id="email"
									placeholder="example@example.com"
									type="email"
									{...field}
								/>
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
				<Button className="w-full" disabled={isPending} type="submit">
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							登録中...
						</>
					) : (
						"登録"
					)}
				</Button>
			</form>
		</Form>
	);
}

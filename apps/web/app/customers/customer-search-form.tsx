"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useIsHydrated } from "../../libs/use-is-hydrated";

type CustomerSearchFormValues = {
	keyword: string;
};

export function CustomerSearchForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isHydrated } = useIsHydrated();

	const form = useForm<CustomerSearchFormValues>({
		defaultValues: {
			keyword: searchParams.get("keyword") || "",
		},
	});

	function onSubmit(values: CustomerSearchFormValues) {
		const params = new URLSearchParams();
		if (values.keyword) {
			params.set("keyword", values.keyword);
		}
		router.push(`/customers?${params}` as Route);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="keyword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>検索キーワード</FormLabel>
							<FormDescription>
								名前、メールアドレス、電話番号で検索できます
							</FormDescription>
							<div className="flex gap-4 items-center">
								<FormControl>
									<Input {...field} disabled={!isHydrated} type="text" />
								</FormControl>
								<Button disabled={!isHydrated} type="submit">
									<Search className="mr-2 h-4 w-4" />
									検索
								</Button>
							</div>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}

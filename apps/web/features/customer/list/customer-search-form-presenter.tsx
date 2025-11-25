"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import {
	CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH,
	customersConditionSchema,
} from "./schema";

export const formSchema = v.omit(customersConditionSchema, ["page"]);

export function CustomerSearchForm({
	condition,
}: {
	condition: v.InferInput<typeof formSchema>;
}) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<v.InferInput<typeof formSchema>>({
		defaultValues: { keyword: condition.keyword },
		resolver: valibotResolver(formSchema),
	});

	function onSubmit({ keyword }: v.InferOutput<typeof formSchema>) {
		const params = new URLSearchParams();
		if (keyword) {
			params.set("keyword", keyword);
		}

		router.push(`/customers?${params}`);
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
								名前、メールアドレス、電話番号（最大
								{CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH}文字）
							</FormDescription>
							<div className="flex gap-4 items-center">
								<FormControl>
									<Input
										{...field}
										disabled={!isHydrated}
										maxLength={CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH}
										type="text"
									/>
								</FormControl>
								<Button disabled={!isHydrated} type="submit">
									<Search className="mr-2 h-4 w-4" />
									検索
								</Button>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}

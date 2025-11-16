"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const searchFormSchema = v.object({
	dateFrom: v.optional(v.string()),
	dateTo: v.optional(v.string()),
	keyword: v.optional(v.string()),
});

type SearchFormValues = v.InferOutput<typeof searchFormSchema>;

type CustomerNotesSearchFormProps =
	| { condition: Promise<SearchFormValues>; disabled?: never }
	| { disabled: true; condition?: never };

export function CustomerNotesSearchForm(props: CustomerNotesSearchFormProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	// conditionPromise から初期値を取得
	const condition = props.disabled
		? { dateFrom: "", dateTo: "", keyword: "" }
		: use(props.condition);

	const form = useForm<SearchFormValues>({
		defaultValues: {
			dateFrom: condition.dateFrom ?? "",
			dateTo: condition.dateTo ?? "",
			keyword: condition.keyword ?? "",
		},
		resolver: valibotResolver(searchFormSchema),
	});

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (condition.keyword) count++;
		if (condition.dateFrom) count++;
		if (condition.dateTo) count++;
		return count;
	}, [condition]);

	function onSubmit(values: SearchFormValues) {
		const params = new URLSearchParams();

		if (values.dateFrom) params.set("dateFrom", values.dateFrom);
		if (values.dateTo) params.set("dateTo", values.dateTo);
		if (values.keyword) params.set("keyword", values.keyword);

		router.push(`?${params.toString()}`);
		// setIsOpen(false);
	}

	function handleReset() {
		form.reset({
			dateFrom: "",
			dateTo: "",
			keyword: "",
		});
		const pathname = window.location.pathname;
		router.push(pathname as never);
	}

	const isDisabled = props.disabled === true;

	return (
		<Collapsible disabled={isDisabled} onOpenChange={setIsOpen} open={isOpen}>
			<Card>
				<CollapsibleTrigger asChild disabled={isDisabled}>
					<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CardTitle className="h-6 flex items-center">検索</CardTitle>
								{activeFilterCount > 0 && (
									<Badge variant="secondary">{activeFilterCount}</Badge>
								)}
							</div>
							{isOpen ? (
								<ChevronUp className="h-5 w-5 text-muted-foreground" />
							) : (
								<ChevronDown className="h-5 w-5 text-muted-foreground" />
							)}
						</div>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent>
						<Form {...form}>
							<form
								className="space-y-4"
								onSubmit={form.handleSubmit(onSubmit)}
							>
								<div className="grid md:grid-cols-2 gap-4">
									{/* キーワード検索 */}
									<FormField
										control={form.control}
										name="keyword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>キーワード</FormLabel>
												<FormDescription>本文、記入者名</FormDescription>
												<FormControl>
													<Input type="text" {...field} disabled={isDisabled} />
												</FormControl>
											</FormItem>
										)}
									/>

									{/* 日付範囲 */}
									<div className="flex gap-4 flex-wrap">
										<FormField
											control={form.control}
											name="dateFrom"
											render={({ field }) => (
												<FormItem>
													<FormLabel>記入日（開始）</FormLabel>
													<FormDescription>入力日以降</FormDescription>
													<FormControl>
														<Input
															type="date"
															{...field}
															disabled={isDisabled}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="dateTo"
											render={({ field }) => (
												<FormItem>
													<FormLabel>記入日（終了）</FormLabel>
													<FormDescription>入力日より前</FormDescription>
													<FormControl>
														<Input
															type="date"
															{...field}
															disabled={isDisabled}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										className="flex-1"
										disabled={isDisabled}
										type="submit"
									>
										検索
									</Button>
									<Button
										disabled={isDisabled}
										onClick={handleReset}
										type="button"
										variant="outline"
									>
										クリア
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}

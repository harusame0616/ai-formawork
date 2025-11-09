"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useIsHydrated } from "../../libs/use-is-hydrated";
import { Search } from "lucide-react";

type SearchFormProps = {
	defaultKeyword: string;
};

export function SearchForm({ defaultKeyword }: SearchFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [keyword, setKeyword] = useState(defaultKeyword);
	const [isPending, startTransition] = useTransition();
	const isHydrated = useIsHydrated();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		startTransition(() => {
			const params = new URLSearchParams(searchParams);
			if (keyword) {
				params.set("keyword", keyword);
			} else {
				params.delete("keyword");
			}
			params.delete("page"); // Reset to page 1 on new search
			router.push(`/customers?${params.toString()}`);
		});
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="text"
				placeholder="名前、メールアドレス、電話番号で検索"
				value={keyword}
				onChange={(e) => setKeyword(e.target.value)}
				disabled={!isHydrated || isPending}
				className="flex-1"
			/>
			<Button type="submit" disabled={!isHydrated || isPending}>
				<Search className="mr-2 h-4 w-4" />
				検索
			</Button>
		</form>
	);
}

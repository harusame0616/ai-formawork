"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useIsHydrated } from "../../libs/use-is-hydrated";

export function CustomerSearchForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isHydrated } = useIsHydrated();

	const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (keyword) {
			params.set("keyword", keyword);
		}
		router.push(`/customers?${params.toString()}`);
	}

	return (
		<form className="flex gap-2" onSubmit={handleSubmit}>
			<Input
				disabled={!isHydrated}
				onChange={(e) => setKeyword(e.target.value)}
				placeholder="名前、メールアドレス、電話番号で検索"
				type="text"
				value={keyword}
			/>
			<Button disabled={!isHydrated} type="submit">
				<Search className="mr-2 h-4 w-4" />
				検索
			</Button>
		</form>
	);
}

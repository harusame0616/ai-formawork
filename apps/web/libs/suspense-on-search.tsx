"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, type SuspenseProps } from "react";

function SuspenseOnSearchInner({ children, fallback }: SuspenseProps) {
	const search = useSearchParams();

	return (
		<Suspense fallback={fallback} key={search.toString()}>
			{children}
		</Suspense>
	);
}

export function SuspenseOnSearch({ children, fallback }: SuspenseProps) {
	return (
		<Suspense fallback={fallback}>
			<SuspenseOnSearchInner fallback={fallback}>
				{children}
			</SuspenseOnSearchInner>
		</Suspense>
	);
}

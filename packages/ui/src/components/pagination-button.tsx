"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./pagination";

type PaginationButtonProps = {
	page: number;
	isActive?: boolean;
	disabled?: boolean;
	variant?: "default" | "previous" | "next";
	size?: "default" | "icon";
	children?: ReactNode;
};

export function PaginationButton({
	page,
	isActive = false,
	disabled = false,
	variant = "default",
	size = "default",
	children,
}: PaginationButtonProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const buildPageUrl = (pageNum: number): string => {
		const params = new URLSearchParams(searchParams);
		params.set("page", String(pageNum));
		return `${pathname}?${params.toString()}`;
	};

	const href = buildPageUrl(page);

	if (variant === "previous") {
		return (
			<PaginationPrevious
				aria-disabled={disabled}
				href={disabled ? "" : href}
				onClick={disabled ? (e) => e.preventDefault() : undefined}
				size={size}
				style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
			/>
		);
	}

	if (variant === "next") {
		return (
			<PaginationNext
				aria-disabled={disabled}
				href={disabled ? "" : href}
				onClick={disabled ? (e) => e.preventDefault() : undefined}
				size={size}
				style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
			/>
		);
	}

	return (
		<PaginationLink
			aria-disabled={disabled}
			href={disabled ? "" : href}
			isActive={isActive}
			onClick={disabled ? (e) => e.preventDefault() : undefined}
			size={size}
			style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
		>
			{children ?? page}
		</PaginationLink>
	);
}
